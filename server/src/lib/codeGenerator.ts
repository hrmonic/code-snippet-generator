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

// Fonction helper pour remplacer les placeholders
function replacePlaceholders(
  code: string,
  options: Record<string, unknown>,
  sanitizeFn: (value: string) => string = (v) => v
): string {
  let result = code;

  for (const [key, value] of Object.entries(options)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    
    // Gérer les arrays (pour multiselect)
    if (Array.isArray(value)) {
      const arrayCode = value
        .map((item, index) => {
          if (typeof item === 'object' && item !== null) {
            // Objet avec label et value
            return `            <li><a href="#${item.value || item}">${item.label || item}</a></li>`;
          }
          // String simple
          const linkMap: Record<string, string> = {
            home: 'Accueil',
            about: 'À propos',
            services: 'Services',
            portfolio: 'Portfolio',
            blog: 'Blog',
            contact: 'Contact',
          };
          return `            <li><a href="#${item}">${linkMap[item as string] || item}</a></li>`;
        })
        .join('\n');
      result = result.replace(placeholder, arrayCode);
      continue;
    }

    // Gérer les booleans (pour checkboxes)
    if (typeof value === 'boolean') {
      // Pour les conditions Handlebars-like dans le code
      // Pattern: {{#if key}}...{{/if}}
      const ifPattern = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{/if}}`, 'g');
      // Pattern: {{#unless key}}...{{/unless}}
      const unlessPattern = new RegExp(`{{#unless ${key}}}([\\s\\S]*?){{/unless}}`, 'g');
      
      if (value) {
        // Si true: garder le contenu de {{#if}}, supprimer {{#unless}}
        result = result.replace(ifPattern, '$1');
        result = result.replace(unlessPattern, '');
      } else {
        // Si false: supprimer {{#if}}, garder le contenu de {{#unless}}
        result = result.replace(ifPattern, '');
        result = result.replace(unlessPattern, '$1');
      }
      // Retirer aussi les placeholders simples
      result = result.replace(placeholder, '');
      continue;
    }

    // Gérer les objets (pour les options complexes)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const objStr = JSON.stringify(value);
      result = result.replace(placeholder, sanitizeFn(objStr));
      continue;
    }

    // Valeur simple
    result = result.replace(placeholder, sanitizeFn(String(value)));
  }

  // Nettoyer les conditions non résolues (après tous les remplacements)
  result = result.replace(/{{#if\s+\w+}}[\s\S]*?{{\/if}}/g, '');
  result = result.replace(/{{#unless\s+\w+}}[\s\S]*?{{\/unless}}/g, '');
  result = result.replace(/{{#each\s+\w+}}[\s\S]*?{{\/each}}/g, '');
  
  // Nettoyer les placeholders restants (optionnels)
  result = result.replace(/{{[^}]+}}/g, '');

  return result;
}

// Strategies de génération par langage
class PhpGeneratorStrategy implements CodeGeneratorStrategy {
  generate(snippet: any, options: Record<string, unknown>): GenerateResult {
    let code = snippet.code;
    code = replacePlaceholders(code, options, (v) => security.sanitizeInput(v));

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

    code = replacePlaceholders(code, options, (v) => security.sanitizeInput(v));

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
    
    // Traitement spécial pour navbar avec navLinks
    if (snippet.feature === 'navbar' && options.navLinks && Array.isArray(options.navLinks)) {
      const navLinks = options.navLinks as string[];
      const linkMap: Record<string, { href: string; label: string }> = {
        home: { href: '#home', label: 'Accueil' },
        about: { href: '#about', label: 'À propos' },
        services: { href: '#services', label: 'Services' },
        portfolio: { href: '#portfolio', label: 'Portfolio' },
        blog: { href: '#blog', label: 'Blog' },
        contact: { href: '#contact', label: 'Contact' },
      };
      
      const linksHtml = navLinks
        .map((link) => {
          const linkData = linkMap[link] || { href: `#${link}`, label: link };
          return `            <li><a href="${linkData.href}">${linkData.label}</a></li>`;
        })
        .join('\n');
      
      code = code.replace(/{{navLinks}}/g, linksHtml);
    }
    
    code = replacePlaceholders(code, options, (v) => security.escapeHtml(v));

    return { code, filename: 'index.html', tests: snippet.tests };
  }
}

class CssGeneratorStrategy implements CodeGeneratorStrategy {
  generate(snippet: any, options: Record<string, unknown>): GenerateResult {
    let code = snippet.code;
    code = replacePlaceholders(code, options, (v) => v);

    return { code, filename: 'styles.css', tests: snippet.tests };
  }
}

class JavascriptGeneratorStrategy implements CodeGeneratorStrategy {
  generate(snippet: any, options: Record<string, unknown>): GenerateResult {
    let code = snippet.code;
    code = replacePlaceholders(code, options, (v) => security.escapeJs(v));

    return { code, filename: 'script.js', tests: snippet.tests };
  }
}

class SqlGeneratorStrategy implements CodeGeneratorStrategy {
  generate(snippet: any, options: Record<string, unknown>): GenerateResult {
    let code = snippet.code;

    // Sécurisation spéciale pour SQL
    code = replacePlaceholders(code, options, (v) => security.sanitizeSqlIdentifier(v));

    return { code, filename: 'query.sql', tests: snippet.tests };
  }
}

export const codeGenerator = new CodeGenerator();
