import { codeGenerator } from '../codeGenerator.js';
import { snippetLoader } from '../snippetLoader.js';

// Mock snippetLoader
jest.mock('../snippetLoader.js');

describe('CodeGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate PHP CRUD code', async () => {
    const mockSnippet = {
      id: 'php-crud',
      name: 'CRUD PHP',
      code: 'class {{entityName}}Controller { private $tableName = \'{{tableName}}\'; }',
      language: 'php',
      feature: 'crud',
      variables: [],
      security: { sqlInjection: true, xss: false },
    };

    (snippetLoader.getSnippet as jest.Mock).mockResolvedValue(mockSnippet);

    const result = await codeGenerator.generate({
      language: 'php',
      feature: 'crud',
      options: {
        entityName: 'User',
        tableName: 'users',
      },
    });

    const first = Array.isArray(result) ? result[0] : result;
    expect(first).toBeDefined();
    expect(first!.code).toContain('UserController');
    expect(first!.code).toContain('users');
    expect(first!.filename).toBe('UserController.php');
  });

  it('should generate HTML form code', async () => {
    const mockSnippet = {
      id: 'html5-form',
      name: 'Formulaire HTML5',
      code: '<form action="{{action}}" method="{{method}}"></form>',
      language: 'html5',
      feature: 'form',
      variables: [],
      security: { sqlInjection: false, xss: true },
    };

    (snippetLoader.getSnippet as jest.Mock).mockResolvedValue(mockSnippet);

    const result = await codeGenerator.generate({
      language: 'html5',
      feature: 'form',
      options: {
        action: '/submit',
        method: 'POST',
      },
    });

    const first = Array.isArray(result) ? result[0] : result;
    expect(first).toBeDefined();
    expect(first!.code).toContain('/submit');
    expect(first!.code).toContain('POST');
    expect(first!.filename).toBe('index.html');
  });

  it('should throw error if snippet not found', async () => {
    (snippetLoader.getSnippet as jest.Mock).mockResolvedValue(null);

    await expect(
      codeGenerator.generate({
        language: 'php',
        feature: 'crud',
        options: {},
      })
    ).rejects.toThrow('Aucun snippet trouvé');
  });

  it('should generate JavaScript with conditional blocks ({{#if}})', async () => {
    const mockSnippet = {
      id: 'javascript-router',
      name: 'React Router',
      code:
        '{{#if includeLayout}}\n<Layout />\n{{/if}}\n{{#if includeLogin}}\n<Login />\n{{/if}}\n<App />',
      language: 'javascript',
      feature: 'router',
      variables: [],
      security: { sqlInjection: false, xss: false },
    };

    (snippetLoader.getSnippet as jest.Mock).mockResolvedValue(mockSnippet);

    const result = await codeGenerator.generate({
      language: 'javascript',
      feature: 'router',
      options: {
        includeLayout: true,
        includeLogin: false,
      },
    });

    const first = Array.isArray(result) ? result[0] : result;
    expect(first).toBeDefined();
    expect(first!.code).toContain('<Layout />');
    expect(first!.code).not.toContain('<Login />');
    expect(first!.code).toContain('<App />');
    expect(first!.filename).toBe('script.js');
  });

  it('should strip {{#if}} blocks when option is false', async () => {
    const mockSnippet = {
      id: 'javascript-router',
      name: 'React Router',
      code: 'before\n{{#if includeFeature}}\nfeature block\n{{/if}}\nafter',
      language: 'javascript',
      feature: 'router',
      variables: [],
      security: { sqlInjection: false, xss: false },
    };

    (snippetLoader.getSnippet as jest.Mock).mockResolvedValue(mockSnippet);

    const result = await codeGenerator.generate({
      language: 'javascript',
      feature: 'router',
      options: { includeFeature: false },
    });

    const first = Array.isArray(result) ? result[0] : result;
    expect(first).toBeDefined();
    expect(first!.code).toContain('before');
    expect(first!.code).toContain('after');
    expect(first!.code).not.toContain('feature block');
  });

  it('should generate Java CRUD multiple files when entityName provided', async () => {
    const mockSnippet = {
      id: 'java-crud',
      name: 'CRUD Java',
      code: 'placeholder',
      language: 'java',
      feature: 'crud',
      variables: [],
      security: { sqlInjection: false, xss: false },
    };

    (snippetLoader.getSnippet as jest.Mock).mockResolvedValue(mockSnippet);

    const result = await codeGenerator.generate({
      language: 'java',
      feature: 'crud',
      options: {
        entityName: 'Product',
        tableName: 'products',
        fields: 'id,name,price',
      },
    });

    expect(Array.isArray(result)).toBe(true);
    const results = result as Array<{ code: string; filename?: string }>;
    expect(results).toHaveLength(3);
    expect(results.map((r) => r.filename)).toEqual([
      'ProductController.java',
      'Product.java',
      'ProductService.java',
    ]);
    expect(results[0].code).toContain('ProductController');
    expect(results[0].code).toContain('/api/products');
    expect(results[1].code).toContain('class Product');
    expect(results[2].code).toContain('ProductService');
  });

  it('should sanitize user input in generated PHP code', async () => {
    const mockSnippet = {
      id: 'php-crud',
      name: 'CRUD PHP',
      code: 'echo {{entityName}};',
      language: 'php',
      feature: 'crud',
      variables: [],
      security: { sqlInjection: true, xss: false },
    };

    (snippetLoader.getSnippet as jest.Mock).mockResolvedValue(mockSnippet);

    const result = await codeGenerator.generate({
      language: 'php',
      feature: 'crud',
      options: { entityName: '<script>alert(1)</script>' },
    });

    const first = Array.isArray(result) ? result[0] : result;
    expect(first).toBeDefined();
    // sanitizeInput strips <> so XSS payload is neutralized
    expect(first!.code).not.toContain('<script>');
    expect(first!.code).not.toContain('</script>');
    expect(first!.code).toContain('echo ');
  });
});

