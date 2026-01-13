---
trigger: always_on
---

We follow the **Conventional Commits** specification. This ensures that every commit message is machine-readable and provides a clear history of why a change was made.

### Message Format

Each commit message consists of a **type**, an optional **scope**, and a **subject**:

```text
<type>(<scope>): <description>

```

### Mandatory Rules

* **Type:** Must be one of the following:
* `feat`: A new feature (correlates with `MINOR` in SemVer).
* `fix`: A bug fix (correlates with `PATCH` in SemVer).
* `docs`: Documentation only changes.
* `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
* `refactor`: A code change that neither fixes a bug nor adds a feature.
* `perf`: A code change that improves performance.
* `test`: Adding missing tests or correcting existing tests.
* `chore`: Changes to the build process or auxiliary tools and libraries.


* **Scope:** Optional but encouraged. It should be the name of the package or module affected (e.g., `feat(web):`, `fix(api):`).
* **Subject (Description):**
* Use the **imperative, present tense**: "change" not "changed" nor "changes".
* Don't capitalize the first letter.
* No dot (`.`) at the end.


### Examples

* `feat(auth): add google oauth2 provider`
* `fix(ui): resolve layout shift on mobile navigation`
* `docs: update readme with deployment steps`
* `style: lint and format according to antigravity rules`