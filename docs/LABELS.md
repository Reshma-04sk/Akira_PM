# Repository Labels & Commit Guidelines

We use conventional commit types and map them directly to repository issue/PR labels to maintain a structured project board.

## Commit Types & Description

We enforce semantic conventional commits. Below is the mapping of commit prefixes to repository labels.

| Commit Type | Description | PR / Issue Label |
|:---|:---|:---|
| `feat:` | A new feature or capability | `type: feature` |
| `fix:` | A bug fix or runtime patch | `type: bug` |
| `docs:` | Documentation-only updates | `type: documentation` |
| `style:` | Formatting, missing semi-colons, lint fixes (no logic changes) | `type: enhancement` |
| `refactor:` | Refactoring production code without changing behavior or APIs | `type: refactoring` |
| `test:` | Adding, refactoring, or correcting test suites | `type: testing` |
| `chore:` | Repository configuration, package scripts, or version bumps | `type: chore` |
| `ci:` | GitHub Actions CI/CD workflows edits | `type: ci-cd` |

## Label Rules

1. **Pull Requests**: Pull Requests should have at least one semantic category label.
2. **Issue Categorization**: New issues should be labeled with `type: bug` or `type: feature` upon triage.
3. **Priority Labels**: High-importance items should be decorated with `priority: high` or `severity: blocker` to alert maintainers.
