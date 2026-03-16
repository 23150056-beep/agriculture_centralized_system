# Agri-Sys Agent Instructions

Apply the following project-wide rules automatically:

<applyTo>
- "**/*.+(jsx|js)"
</applyTo>
Always invoke `@agent /agri-sys-frontend` and `@agent /agri-sys-ui-design` mentally when modifying or generating files in the React frontend. Ensure strict adherence to the project's accessibility and Tailwind component rules.

<applyTo>
- "**/*.py"
</applyTo>
Always invoke `@agent /agri-sys-backend` mentally when modifying or generating files in the FastAPI backend. Strict adherence to routing and database imports is required.
