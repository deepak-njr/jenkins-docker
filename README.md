# Getting Started with saaspe application

# Project Setup

1. Clone this repository
1. Run `yarn`
1. Run `sh generate-config.sh -d` which will generate config file for dev environment, Please read the generate-config.sh to learn more
1. Run `yarn start` to run the application

---

# Git Guidelines

## Branching

- Environment Branches
  - dev - Developer can deploy and test their features
  - sit - System Integration Testing
  - pre-prod - Replica of Production Branch
  - main - Product branch
  - jnt - Customer Branch
- Feature Branch
  - naming convension would be `feature/task-<azure kanban task id>`
  - feature branches should always created from the `dev` branch
- Bug Fix Branch
  - naming convension would be `bugfix/issue-<azure kanban task id>`
- Hot Fix Branch
  - naming convension would be `hotfix/issue-<azure kanban task id>`
  - hotfix branches can be created from any environment branches based on the severity

**Note:**

- The environment branches are prohibited branches to developers to work
- Pushing code to the environment branches would require pull request with minimum 1-2 approval based on the target branch

## Do's & Dont's

1. Do not commit package-lock.json file, this project follows yarn
1. Commit yarn file only when you install new package or you change version of any package

---

# Style Guidelines

## Alias

- Components - `@components/**.(tsx|ts|scss|js|json)`
- Modules - `@modules/**.(tsx|ts|scss|js|json)`
- Assets - `@assets/**.(png|pdf|jpg|ttf|svg)`
- Services - `@services/**.(ts|js)`
- Services - `@services/**.(ts|js)`
- Utils - `@utils/**.(ts|js)`
- styles - `@styles/**.(scss|css)`

## Import Guidelines

1. Third-party dependencies should imported first in the file
1. Global Components should imported second in the file
1. Internal / Siblings should imported third in the file
1. Style sheets should imported last in the file

Note: Importing styles within the `(scss|css)` should use `@import ~@styles/**.(scss|css)` if not import will not work

## Naming convention

- Folders should be Capitalized
- Files should be Capitalized
- variables should follow CamelCase (Note: it should not contain special characters (or) numbers)
- stylesheets should be named in small letters without special characters (Note: hypens can be included)
- Asset files should be named in small letters wihtout special characters (Note: hypens can be included)

**Note:** No files should have space in their names
