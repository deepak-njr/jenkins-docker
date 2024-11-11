import {
  Dashboard,
  Login,
  Application,
  ApplicationDrilldown,
  AskAmigo,
  AskAmigoChat,
  BudgetAndForecast,
  ApplicatinOnboarding,
  Users,
  SignUp,
  ThanksCard,
  VerifyCard,
  CreatePasswordCard,
  SuccessCard,
  EmailCheck,
  ResetPassword,
  PasswordUpdatedMessage,
  ChangePassword,
  Departments,
  DepartmentDrillDown,
  DepartmentsOnboarding,
  UserDrilldown,
  Contracts,
  ContractsDrilldown,
  OnboardingMgmt,
  OnboardinApplicationDrilldown,
  OnboardinUserDrilldown,
  OnboardingDepartmentDrilldown,
  RequestTracker,
  Resources,
  Subscriptions,
  UserConsentSuccess,
  UserManagement,
  OverView as MultiCloudOverview,
  EmailSent,
  Renewals,
  Invoices,
  Optimize,
  MarketPlace,
  Projects,
  ProjectOnboarding,
  OnboardingProjectDrilldown,
  AddNewContract,
  OnboardingContractDrilldown,
  Integrations,
  MulticloudOnboarding,
  MulticloudList,
  AddNewInvoice,
  Workflows,
  CreateWorkflow,
  PreferencesList,
  CLM,
  CLMDashboard,
  CLMContractsDrilldown,
  AddNewContractDocument,
  VerifyOtp,
  AuditLogs,
  UsersOnboarding,
} from "@modules/index";
import { Redirect } from "@modules/Auth/Redirect";
import { ReactNode } from "react";
import { permissions } from "@utils/Roles";
import { UnAuthorized } from "@components/ErrorHandlers/UnAuthorized";
import { ProjectOverview } from "~/Modules/Projects/SubModues/Drilldown/ProjectsOverview";
import { CreateUser } from "~/Modules/Administration/UserManagement/CreateUser";
import { Templates } from "~/Modules/ContractManagement/Templates/Templates";
import { AddNewTemplateDocument } from "~/Modules/ContractManagement/Templates/Onboarding/AddNewTemplateDocument";
import { TemplatesDrilldown } from "~/Modules/ContractManagement/Templates/Drilldown/Overview/TemplatesDrilldown";

import { BudgetsOnboardingWrapper } from "~/Modules/MultiCloud/BudgetAndForecast/Budget/onBoarding/Wrapper";
import { BudgetDetails } from "~/Modules/MultiCloud/BudgetAndForecast/Budget/onBoarding/BudgetDetails";
import { AdaptorsRedirect } from "~/Modules/Application/SubModules/DrillDown/Overview/Components/Adaptors/AdaptorsRedirect";

import PageNotExist from "~/Components/PageNotExist/PageNotExist";

interface RouteBase {
  path: string;
  element: ReactNode;
}

interface ProtectedRoutes extends RouteBase {
  roles: string[];
}

export const protectRoutes: ProtectedRoutes[] = [
  {
    path: "/askamigo",
    element: <AskAmigo />,
    roles: ["*"],
  },
  {
    path: "/askamigo/:id",
    element: <AskAmigoChat />,
    roles: ["*"],
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    roles: ["*"],
  },
  {
    path: "/applications",
    element: <Application />,
    roles: [permissions.VIEW_APPLICATION],
  },
  {
    path: "/applications/:id",
    element: <ApplicationDrilldown />,
    roles: [permissions.VIEW_APPLICATION],
  },
  {
    path: "/applications/onboarding/*",
    element: <ApplicatinOnboarding />,
    roles: [permissions.ADD_APPLICATION],
  },
  {
    path: "/users",
    element: <Users />,
    roles: [permissions.VIEW_USER],
  },
  {
    path: "/users/:id",
    element: <UserDrilldown />,
    roles: [permissions.VIEW_USER],
  },
  {
    path: "/users/onboarding",
    element: <UsersOnboarding />,
    roles: [permissions.ADD_USER],
  },
  {
    path: "/departments",
    element: <Departments />,
    roles: [permissions.VIEW_DEPARTMENT],
  },
  {
    path: "/departments/onboarding",
    element: <DepartmentsOnboarding />,
    roles: [permissions.ADD_DEPARTMENT],
  },
  {
    path: "/departments/:id",
    element: <DepartmentDrillDown />,
    roles: [permissions.VIEW_DEPARTMENT],
  },
  {
    path: "/departments/projects/:id",
    element: <ProjectOverview />,
    roles: [permissions.VIEW_DEPARTMENT],
  },

  {
    path: "/departments/:id/projects/onboarding/*",
    element: <ProjectOnboarding />,
    roles: [permissions.ADD_DEPARTMENT],
  },
  {
    path: "/projects/:id",
    element: <ProjectOverview />,
    roles: [permissions.VIEW_DEPARTMENT],
  },
  {
    path: "/onboarding-management/:id",
    element: <OnboardingMgmt />,
    roles: [permissions.VIEW_ONBOARDINGMGMT],
  },
  {
    path: "/onboarding-management/applications/:id",
    element: <OnboardinApplicationDrilldown />,
    roles: [permissions.VIEW_ONBOARDINGMGMT],
  },
  {
    path: "/onboarding-management/users/:id",
    element: <OnboardinUserDrilldown />,
    roles: [permissions.VIEW_ONBOARDINGMGMT],
  },
  {
    path: "/onboarding-management/departments/:id",
    element: <OnboardingDepartmentDrilldown />,
    roles: [permissions.VIEW_ONBOARDINGMGMT],
  },
  {
    path: "/onboarding-management/contracts/:id",
    element: <OnboardingContractDrilldown />,
    roles: [permissions.VIEW_ONBOARDINGMGMT],
  },

  {
    path: "/onboarding-management/projects/:id",
    element: <OnboardingProjectDrilldown />,
    roles: [permissions.VIEW_ONBOARDINGMGMT],
  },
  {
    path: "/track-requests",
    element: <RequestTracker />,
    roles: [permissions.VIEW_REQUESTMGMT],
  },
  {
    path: "/multi-cloud/add",
    element: <MulticloudOnboarding />,
    roles: ["*"],
  },
  {
    path: "/multi-cloud/overview",
    element: <MultiCloudOverview />,
    roles: ["*"],
  },
  {
    path: "/multi-cloud/budget-forecast/:id",
    element: <BudgetAndForecast />,
    roles: ["*"],
  },
  {
    path: "/multi-cloud/budget-forecast/budget/onboarding/*",
    element: <BudgetDetails />,
    roles: [permissions.CREATE_BUDGET],
  },
  {
    path: "/multi-cloud/optimize",
    element: <Optimize />,
    roles: ["*"],
  },
  {
    path: "/multi-cloud/resources",
    element: <Resources />,
    roles: ["*"],
  },
  {
    path: "/contracts",
    element: <Contracts />,
    roles: [permissions.VIEW_APPLICATION],
  },
  {
    path: "clm/dashboard",
    element: <CLMDashboard />,
    roles: [permissions.VIEW_CONTRACT],
  },
  {
    path: "clm/contracts",
    element: <CLM />,
    roles: [permissions.VIEW_CONTRACT],
  },
  {
    path: "/clm/templates",
    element: <Templates />,
    roles: [permissions.VIEW_CONTRACT],
  },
  {
    path: "/clm/templates/create",
    element: <AddNewTemplateDocument />,
    roles: [permissions.VIEW_CONTRACT],
  },
  {
    path: "/clm/templates/edit/:id",
    element: <AddNewTemplateDocument />,
    roles: [permissions.VIEW_CONTRACT],
  },
  {
    path: "clm/templates/view/:id",
    element: <TemplatesDrilldown />,
    roles: [permissions.VIEW_CONTRACT],
  },
  {
    path: "clm/contracts/add",
    element: <AddNewContractDocument />,
    roles: [permissions.VIEW_CONTRACT],
  },
  {
    path: "clm/contracts/view/:id",
    element: <CLMContractsDrilldown />,
    roles: [permissions.VIEW_CONTRACT],
  },
  {
    path: "/applications/:id/contracts/add",
    element: <AddNewContract />,
    roles: [permissions.ADD_APPLICATION],
  },
  {
    path: "/contracts/:id",
    element: <ContractsDrilldown />,
    roles: [permissions.VIEW_APPLICATION],
  },
  {
    path: "/subscriptions",
    element: <Subscriptions />,
    roles: [permissions.VIEW_APPLICATION],
  },
  {
    path: "/renewals",
    element: <Renewals />,
    roles: [permissions.VIEW_APPLICATION],
  },
  {
    path: "/invoices",
    element: <Invoices />,
    roles: [permissions.VIEW_APPLICATION],
  },
  {
    path: "/invoices/add",
    element: <AddNewInvoice />,
    roles: [permissions.VIEW_APPLICATION],
  },
  {
    path: "/marketplace",
    element: <MarketPlace />,
    roles: ["*"],
  },
  {
    path: "/projects",
    element: <Projects />,
    roles: [permissions.VIEW_DEPARTMENT],
  },
  {
    path: "/administration/user-management",
    element: <UserManagement />,
    roles: [permissions.VIEW_ADMINUSER],
  },
  {
    path: "/administration/multicloud",
    element: <MulticloudList />,
    roles: [permissions.VIEW_ADMINUSER],
  },
  {
    path: "/administration/user-management/add",
    element: <CreateUser />,
    roles: [permissions.ADD_ADMINUSER],
  },
  {
    path: "/administration/preferences",
    element: <PreferencesList />,
    roles: [permissions.ADD_ADMINUSER],
  },
  {
    path: "/integrations",
    element: <Integrations />,
    roles: [permissions.ENABLE_INTEGRATION],
  },
  {
    path: "/integrations/:id",
    element: <Integrations />,
    roles: [permissions.ENABLE_INTEGRATION],
  },
  {
    path: "/workflows",
    element: <Workflows />,
    roles: [permissions.VIEW_WORKFLOW],
  },
  {
    path: "/workflows/create",
    element: <CreateWorkflow />,
    roles: [permissions.VIEW_WORKFLOW],
  },
  {
    path: "/audit-logs",
    element: <AuditLogs />,
    roles: ["*"],
  },
  {
    path: "/adaptor/authorize",
    element: <AdaptorsRedirect />,
    roles: ["*"],
  },
  {
    path: "/page-notexist",
    element: <PageNotExist/>,
    roles: ["*"],
  }
];

export const globalRoutes = [
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/auth/user-consent-success",
    element: <UserConsentSuccess />,
  },
  {
    path: "/auth/signup",
    element: <SignUp />,
  },
  {
    path: "/auth/thanks",
    element: <ThanksCard />,
  },
  {
    path: "/auth/verify",
    element: <VerifyCard />,
  },
  {
    path: "/auth/verify-otp",
    element: <VerifyOtp />,
  },
  {
    path: "/auth/create-password",
    element: <CreatePasswordCard />,
  },
  {
    path: "/auth/signup/success",
    element: <SuccessCard />,
  },
  {
    path: "/auth/verify-email",
    element: <EmailCheck />,
  },
  {
    path: "/auth/verify-email/sent",
    element: <EmailSent />,
  },
  {
    path: "/auth/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/auth/password-updated-message",
    element: <PasswordUpdatedMessage />,
  },
  {
    path: "/auth/change-password",
    element: <ChangePassword />,
    roles: ["*"],
  },
  {
    path: "/authorize/redirect",
    element: <Redirect />,
  },
  {
    path: "/unauthorized-entry",
    element: <UnAuthorized />,
  },
  
];
