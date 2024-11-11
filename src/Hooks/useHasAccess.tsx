import { useAuth } from "./useAuth";
import { isNull } from "lodash";
export const useHasAccess = () => {
  const { user } = useAuth();

  const hasPermissions = (roles: string[]) => {
    if (isNull(user)) {
      return false;
    }

    if (!user.access) {
      return false;
    }

    if (roles[0] === "*") {
      return true;
    } else {
      return user.access.some((permissionName) =>
        Boolean(roles.includes(permissionName))
      );
    }
  };

  const hasRole = (role: string) => {
    if (isNull(user)) {
      return false;
    }

    if (!user.access) {
      return false;
    }

    if (role === "*") {
      return true;
    } else {
      return user.role === role;
    }
  };

  return {
    hasPermissions,
    hasRole,
  };

  //   const { userTypeId } = currentUser || { userTypeId: null };

  //   if (!userTypeId) {
  //     return false;
  //   }
  //   if (typeof roleNames === "number") {
  //     return userTypeId === roleNames;
  //   } else if (Array.isArray(roleNames)) {
  //     return roleNames.some((role) => role === userTypeId);
  //   } else {
  //     return false;
  //   }
};
