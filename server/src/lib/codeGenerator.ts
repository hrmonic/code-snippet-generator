import { snippetLoader } from './snippetLoader.js';
import { security } from './security/index.js';
import type { GenerateRequest, GenerateResult } from '../types/index.js';

interface CodeGeneratorStrategy {
  generate(snippet: any, options: Record<string, unknown>): GenerateResult | GenerateResult[];
}

class CodeGenerator {
  private strategies: Map<string, CodeGeneratorStrategy> = new Map();

  constructor() {
    // Strategy pattern pour chaque langage
    this.strategies.set('php', new PhpGeneratorStrategy());
    this.strategies.set('java', new JavaGeneratorStrategy());
    this.strategies.set('html5', new HtmlGeneratorStrategy());
    this.strategies.set('css3', new CssGeneratorStrategy());
    this.strategies.set('javascript', new JavascriptGeneratorStrategy());
    this.strategies.set('sql', new SqlGeneratorStrategy());
  }

  async generate(request: GenerateRequest): Promise<GenerateResult | GenerateResult[]> {
    const snippet = await snippetLoader.getSnippet(request.language, request.feature);

    if (!snippet) {
      throw new Error(
        `Aucun snippet trouvé pour ${request.language} / ${request.feature}`
      );
    }

    const strategy = this.strategies.get(request.language);
    if (!strategy) {
      throw new Error(`Stratégie non trouvée pour le langage ${request.language}`);
    }

    const result = strategy.generate(snippet, request.options);
    
    // Si le résultat est un tableau, on retourne le premier élément pour la compatibilité
    // Le frontend pourra être amélioré pour gérer plusieurs fichiers
    return Array.isArray(result) ? result[0] : result;
  }
}

// Strategies de génération par langage
class PhpGeneratorStrategy implements CodeGeneratorStrategy {
  generate(snippet: any, options: Record<string, unknown>): GenerateResult {
    let code = snippet.code;

    // Remplacement des variables
    for (const [key, value] of Object.entries(options)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const sanitized = security.sanitizeInput(String(value));
      code = code.replace(placeholder, sanitized);
    }

    // Génération de nom de fichier
    const filename = options.entityName
      ? `${String(options.entityName)}Controller.php`
      : 'generated.php';

    return { code, filename, tests: snippet.tests };
  }
}

class JavaGeneratorStrategy implements CodeGeneratorStrategy {
  generate(snippet: any, options: Record<string, unknown>): GenerateResult | GenerateResult[] {
    let code = snippet.code;

    // Pour CRUD Java, on peut générer plusieurs fichiers
    if (snippet.feature === 'crud' && options.entityName) {
      return this.generateCrudFiles(snippet, options);
    }

    for (const [key, value] of Object.entries(options)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const sanitized = security.sanitizeInput(String(value));
      code = code.replace(placeholder, sanitized);
    }

    const filename = options.entityName
      ? `${String(options.entityName)}Controller.java`
      : 'Generated.java';

    return { code, filename, tests: snippet.tests };
  }

  private generateCrudFiles(snippet: any, options: Record<string, unknown>): GenerateResult[] {
    const entityName = String(options.entityName);
    const tableName = String(options.tableName || entityName.toLowerCase() + 's');
    const fields = String(options.fields || 'id,name,email').split(',').map(f => f.trim());

    // Génération du Controller
    const controllerCode = this.generateControllerCode(entityName, tableName);
    
    // Génération du Model
    const modelCode = this.generateModelCode(entityName, fields);
    
    // Génération du Service
    const serviceCode = this.generateServiceCode(entityName, tableName);

    return [
      {
        code: controllerCode,
        filename: `${entityName}Controller.java`,
        tests: snippet.tests,
      },
      {
        code: modelCode,
        filename: `${entityName}.java`,
      },
      {
        code: serviceCode,
        filename: `${entityName}Service.java`,
      },
    ];
  }

  private generateControllerCode(entityName: string, tableName: string): string {
    return `package com.example.controller;

import com.example.model.${entityName};
import com.example.service.${entityName}Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/${tableName}")
public class ${entityName}Controller {
    
    @Autowired
    private ${entityName}Service ${tableName}Service;
    
    @GetMapping
    public ResponseEntity<List<${entityName}>> getAll() {
        return ResponseEntity.ok(${tableName}Service.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<${entityName}> getById(@PathVariable Long id) {
        ${entityName} entity = ${tableName}Service.findById(id);
        if (entity == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(entity);
    }
    
    @PostMapping
    public ResponseEntity<${entityName}> create(@RequestBody ${entityName} entity) {
        ${entityName} created = ${tableName}Service.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<${entityName}> update(@PathVariable Long id, @RequestBody ${entityName} entity) {
        ${entityName} updated = ${tableName}Service.update(id, entity);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (${tableName}Service.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}`;
  }

  private generateModelCode(entityName: string, fields: string[]): string {
    const properties = fields
      .map((field) => {
        const type = field.includes('id') ? 'Long' : field.includes('_at') ? 'LocalDateTime' : 'String';
        const name = this.toCamelCase(field);
        return `    private ${type} ${name};`;
      })
      .join('\n');

    const gettersSetters = fields
      .map((field) => {
        const type = field.includes('id') ? 'Long' : field.includes('_at') ? 'LocalDateTime' : 'String';
        const name = this.toCamelCase(field);
        const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
        return `
    public ${type} get${capitalized}() {
        return ${name};
    }
    
    public void set${capitalized}(${type} ${name}) {
        this.${name} = ${name};
    }`;
      })
      .join('\n');

    return `package com.example.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "${entityName.toLowerCase()}s")
public class ${entityName} {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
${properties}

    // Constructors
    public ${entityName}() {}
    
    public ${entityName}(Long id) {
        this.id = id;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
${gettersSetters}
}`;
  }

  private generateServiceCode(entityName: string, tableName: string): string {
    return `package com.example.service;

import com.example.model.${entityName};
import com.example.repository.${entityName}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ${entityName}Service {
    
    @Autowired
    private ${entityName}Repository ${tableName}Repository;
    
    public List<${entityName}> findAll() {
        return ${tableName}Repository.findAll();
    }
    
    public ${entityName} findById(Long id) {
        Optional<${entityName}> entity = ${tableName}Repository.findById(id);
        return entity.orElse(null);
    }
    
    public ${entityName} save(${entityName} entity) {
        return ${tableName}Repository.save(entity);
    }
    
    public ${entityName} update(Long id, ${entityName} entity) {
        if (${tableName}Repository.existsById(id)) {
            entity.setId(id);
            return ${tableName}Repository.save(entity);
        }
        return null;
    }
    
    public boolean delete(Long id) {
        if (${tableName}Repository.existsById(id)) {
            ${tableName}Repository.deleteById(id);
            return true;
        }
        return false;
    }
}`;
  }

  private toCamelCase(str: string): string {
    return str
      .split('_')
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }
}

class HtmlGeneratorStrategy implements CodeGeneratorStrategy {
  generate(snippet: any, options: Record<string, unknown>): GenerateResult {
    let code = snippet.code;

    for (const [key, value] of Object.entries(options)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const sanitized = security.escapeHtml(String(value));
      code = code.replace(placeholder, sanitized);
    }

    return { code, filename: 'index.html', tests: snippet.tests };
  }
}

class CssGeneratorStrategy implements CodeGeneratorStrategy {
  generate(snippet: any, options: Record<string, unknown>): GenerateResult {
    let code = snippet.code;

    for (const [key, value] of Object.entries(options)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      code = code.replace(placeholder, String(value));
    }

    return { code, filename: 'styles.css', tests: snippet.tests };
  }
}

class JavascriptGeneratorStrategy implements CodeGeneratorStrategy {
  generate(snippet: any, options: Record<string, unknown>): GenerateResult {
    let code = snippet.code;

    for (const [key, value] of Object.entries(options)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const sanitized = security.escapeJs(String(value));
      code = code.replace(placeholder, sanitized);
    }

    return { code, filename: 'script.js', tests: snippet.tests };
  }
}

class SqlGeneratorStrategy implements CodeGeneratorStrategy {
  generate(snippet: any, options: Record<string, unknown>): GenerateResult {
    let code = snippet.code;

    // Sécurisation spéciale pour SQL
    for (const [key, value] of Object.entries(options)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const sanitized = security.sanitizeSqlIdentifier(String(value));
      code = code.replace(placeholder, sanitized);
    }

    return { code, filename: 'query.sql', tests: snippet.tests };
  }
}

export const codeGenerator = new CodeGenerator();
