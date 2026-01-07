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

    expect(result.code).toContain('UserController');
    expect(result.code).toContain('users');
    expect(result.filename).toBe('UserController.php');
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

    expect(result.code).toContain('/submit');
    expect(result.code).toContain('POST');
    expect(result.filename).toBe('index.html');
  });

  it('should throw error if snippet not found', async () => {
    (snippetLoader.getSnippet as jest.Mock).mockResolvedValue(null);

    await expect(
      codeGenerator.generate({
        language: 'php',
        feature: 'unknown',
        options: {},
      })
    ).rejects.toThrow('Aucun snippet trouvé');
  });
});

