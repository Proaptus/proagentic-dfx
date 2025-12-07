import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // Domain generator - creates new designer applications
  plop.setGenerator("domain", {
    description: "Create a new engineering domain designer (e.g., CNG Tank, Pressure Vessel)",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the domain name? (e.g., 'cng-tank', 'pressure-vessel')",
        validate: (input: string) => {
          if (!input || input.trim() === "") {
            return "Domain name is required";
          }
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return "Domain name must be lowercase with hyphens only";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "displayName",
        message: "What is the display name? (e.g., 'CNG Tank Designer', 'Pressure Vessel Designer')",
      },
      {
        type: "input",
        name: "description",
        message: "Short description of the domain:",
      },
      {
        type: "list",
        name: "baseTemplate",
        message: "Which template to base this on?",
        choices: ["h2-tank", "generic"],
        default: "h2-tank",
      },
    ],
    actions: (answers) => {
      const actions: PlopTypes.ActionType[] = [];

      if (!answers) return actions;

      const domainName = answers.name as string;
      const domainNameCamel = domainName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const domainNamePascal = domainNameCamel.charAt(0).toUpperCase() + domainNameCamel.slice(1);

      // Create domain configuration
      actions.push({
        type: "add",
        path: "proagentic-dfx/src/lib/domains/{{ dashCase name }}/config.ts",
        templateFile: "templates/domain/config.ts.hbs",
      });

      // Create domain types
      actions.push({
        type: "add",
        path: "proagentic-dfx/src/lib/domains/{{ dashCase name }}/types.ts",
        templateFile: "templates/domain/types.ts.hbs",
      });

      // Create domain index
      actions.push({
        type: "add",
        path: "proagentic-dfx/src/lib/domains/{{ dashCase name }}/index.ts",
        templateFile: "templates/domain/index.ts.hbs",
      });

      // Create mock server (if h2-tank template)
      if (answers.baseTemplate === "h2-tank") {
        actions.push({
          type: "add",
          path: "{{ dashCase name }}-mock-server/package.json",
          templateFile: "templates/domain/mock-server-package.json.hbs",
        });

        actions.push({
          type: "add",
          path: "{{ dashCase name }}-mock-server/src/app/api/health/route.ts",
          templateFile: "templates/domain/api-health.ts.hbs",
        });
      }

      // Update domain registry
      actions.push({
        type: "append",
        path: "proagentic-dfx/src/lib/domains/index.ts",
        template: `export * from './{{ dashCase name }}';`,
      });

      return actions;
    },
  });

  // Mock server generator - creates standalone mock server
  plop.setGenerator("mock-server", {
    description: "Create a new mock server for an engineering domain",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the mock server name? (e.g., 'cng-tank-mock-server')",
      },
      {
        type: "input",
        name: "port",
        message: "What port should it run on?",
        default: "3002",
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{ dashCase name }}/package.json",
        templateFile: "templates/domain/mock-server-package.json.hbs",
      },
      {
        type: "add",
        path: "{{ dashCase name }}/src/app/api/health/route.ts",
        templateFile: "templates/domain/api-health.ts.hbs",
      },
      {
        type: "add",
        path: "{{ dashCase name }}/next.config.ts",
        templateFile: "templates/domain/next-config.ts.hbs",
      },
      {
        type: "add",
        path: "{{ dashCase name }}/tsconfig.json",
        templateFile: "templates/domain/tsconfig.json.hbs",
      },
    ],
  });
}
