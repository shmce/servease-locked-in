MVVM architecture with this folder structure:

src/
├── main.tsx
├── App.tsx
├── index.css
├── shared/
│   ├── models/
│   │   ├── types.ts          # All TypeScript interfaces
│   │   └── apiService.ts     # All API/data fetching functions
│   ├── hooks/                # Reusable React hooks (useMediaQuery, etc.)
│   ├── utils/                # Pure utility functions and constants
│   └── components/           # Global components (Navbar, Footer, etc.)
└── features/
    └── <feature-name>/
        ├── viewModels/
        │   └── use<Feature>ViewModel.ts   # Custom hook: calls Model, manages state
        └── views/
            ├── <Feature>.tsx              # Page container (composes sections)
            └── <Section>.tsx              # Individual section components

Rules:
1. MODEL (shared/models/): Types + API functions. No React code here.
2. VIEWMODEL (features/<name>/viewModels/): Custom React hooks named use<Feature>ViewModel. 
   Calls Model layer, manages useState/useEffect, returns { data, isLoading, error }.
3. VIEW (features/<name>/views/): React components. Calls ViewModel hooks for data. 
   Only manages UI-local state (hover, expanded, etc.) directly.
4. Views NEVER call API functions directly — always go through a ViewModel.
5. Shared code used by 2+ features goes in shared/.
6. Each page component is lazy-loaded in App.tsx.
7. Use Framer Motion for animations, React Router for routing.
8. Use TailwindCSS for styling.

And follow this rules and guidelines since this is the requirements for the to pass the CI/CD

Tribe Rules and Guidelines
This document defines the rules each tribe must follow in its own repository. You do not need access to central workflow internals. Follow these rules through your repo settings, branch protection, CI caller workflow, code, and tests.
1) Rules for All Tribes
1.1 Platform and Architecture Rules
•             Use approved stacks only:
–            Frontend: React with Next.js and TypeScript, React with TypeScript
–            Backend: Node.js with NestJS and TypeScript
–            Mobile: Expo (TypeScript), React Native, or Kotlin/Android
–            Database: Supabase
•             Follow central API contracts (OpenAPI/Swagger).
•             Do not perform direct database cross-access between tribes.
•             Use API Center/Gateway APIs for cross-tribe communication.
•             Use semantic API versioning (v1, v2, etc.).
1.2 Source Control Rules
•             Branch flow is mandatory: test -> uat -> main.
•             Protect test, uat, and main.
•             No direct commits to protected branches.
•             PRs are mandatory for promotion between protected branches.
•             PR authors cannot self-approve.
•             Required status checks must pass before merge.
•             Use Conventional Commits (feat:, fix:, chore:, etc.).
1.3 Global CI Quality Rules
•             Test pass rate must be 100%.
•             Coverage must be >= 80%.
•             Lint must pass with zero errors.
•             TypeScript strict mode must be enabled for TypeScript repos.
•             No hardcoded secrets in source code.
•             High/critical vulnerabilities are blocking on uat and main.
•             All required checks must pass before merge.
1.4 Required Promotion Checks
•             E2E + k6 Enforcement Gate
•             Pipeline Summary
2) Frontend Tribe Rules
2.1 Repository Configuration
•             Keep the FE pipeline caller workflow in .github/workflows and wired to the shared orchestrator.
•             Configure one of these repository variables:
–            FE_SINGLE_SYSTEMS_JSON
–            FE_MULTI_SYSTEMS_JSON
•             Configure required secrets for deploy/promotion (for example Vercel and PR token secrets).
2.2 Code and Test Requirements
•             Next.js + TypeScript must remain the baseline.
•             Maintain lint, unit test, and build scripts.
•             Keep E2E and performance smoke test paths available.
•             Keep coverage at or above 80%.
2.3 Promotion Gate Requirements
•             Playwright and k6 must pass on enforced branches (test, uat) when enabled by policy.
•             Failed E2E/performance gates block promotion.
3) Backend Tribe Rules
3.1 Repository Configuration
•             Keep the BE pipeline caller workflow in .github/workflows and wired to the shared orchestrator.
•             Configure one of these repository variables:
–            BACKEND_SINGLE_SYSTEMS_JSON
–            BACKEND_MULTI_SYSTEMS_JSON
•             Configure required secrets for Sonar and promotion PR automation.
3.2 Code and Test Requirements
•             NestJS + TypeScript strict mode is mandatory.
•             Keep these quality checks runnable in repo scripts:
–            lint
–            typecheck
–            build
–            unit tests with coverage
–            e2e tests
–            migration validation check
•             Coverage must remain >= 80%.
3.3 Promotion Gate Requirements
•             Security scan and Sonar quality gate must pass.
•             k6 performance checks must pass on enforced branches (test, uat).
•             If container release path is enabled for your service, Docker build and image security checks must pass.
4) Mobile Tribe Rules
4.1 Repository Configuration
•             Keep the mobile pipeline caller workflow in .github/workflows and wired to the shared orchestrator.
•             Configure one of these repository variables:
–            MOBILE_SINGLE_SYSTEMS_JSON
–            MOBILE_MULTI_SYSTEMS_JSON
•             Ensure each system is correctly tagged with its mobile stack (expo, react-native, or kotlin).
4.2 Code and Test Requirements
•             TypeScript strict mode is required for Expo and React Native TypeScript projects.
•             Keep lint, typecheck, and unit test scripts healthy.
•             Keep Detox E2E setup healthy for required platforms.
•             Coverage must remain >= 80%.
4.3 Build and Artifact Requirements
•             Android and iOS build jobs must pass where enabled for the system.
•             Detox E2E must pass after successful build jobs.
•             Mobile artifact expectations:
–            Android artifacts: .apk (and optional release .aab)
–            iOS artifacts: .app.zip for app bundles and optional .xcarchive.zip for release-prep
5) UAT and Pre-Production Rules (All Tribes)
5.1 UAT Rules
•             Validate critical user journeys first.
•             Use synthetic test data only.
•             For web systems, validate primary browser support (Chromium and WebKit/Safari unless otherwise approved).
•             If E2E/performance enforcement fails, promotion is blocked.
5.2 Pre-Production Rules
•             Staging must match production architecture as closely as possible.
•             PII must be sanitized/anonymized in copied datasets.
•             Post-deploy smoke tests must pass before deep testing.
6) Operational Rules
•             Branch-specific job skips can be normal when a job is intentionally gated by branch conditions.
•             Do not force-merge around failed quality gates.
•             For critical production incidents only, follow approved hotfix governance with post-incident back-merge and review.

