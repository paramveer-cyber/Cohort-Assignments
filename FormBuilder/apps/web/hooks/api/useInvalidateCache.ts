"use client";

import { trpc } from "~/trpc/client";

export const useInvalidateCache = () => {
  const utils = trpc.useUtils();

  const invalidateCache = async (
    scope?:
      | "auth.me"
      | "forms.list"
      | "forms.get"
      | "forms.listThemes"
      | "forms.listTemplates"
      | "responses.list"
      | "analytics.dashboard"
      | "analytics.formStats"
      | "analytics.userProfile"
      | "admin.stats"
      | "admin.listUsers"
      | "admin.listForms"
      | "public.getForm"
      | "public.exploreForms"
      | "user.getEmailPreferences"
  ) => {
    if (!scope) {
      await utils.invalidate();
      return;
    }

    const [router, procedure] = scope.split(".") as [string, string];

    switch (router) {
      case "auth":
        if (procedure === "me") await utils.auth.me.invalidate();
        break;
      case "forms":
        if (procedure === "list") await utils.forms.list.invalidate();
        else if (procedure === "get") await utils.forms.get.invalidate();
        else if (procedure === "listThemes") await utils.forms.listThemes.invalidate();
        else if (procedure === "listTemplates") await utils.forms.listTemplates.invalidate();
        break;
      case "responses":
        if (procedure === "list") await utils.responses.list.invalidate();
        break;
      case "analytics":
        if (procedure === "dashboard") await utils.analytics.dashboard.invalidate();
        else if (procedure === "formStats") await utils.analytics.formStats.invalidate();
        else if (procedure === "userProfile") await utils.analytics.userProfile.invalidate();
        break;
      case "admin":
        if (procedure === "stats") await utils.admin.stats.invalidate();
        else if (procedure === "listUsers") await utils.admin.listUsers.invalidate();
        else if (procedure === "listForms") await utils.admin.listForms.invalidate();
        break;
      case "public":
        if (procedure === "getForm") await utils.public.getForm.invalidate();
        else if (procedure === "exploreForms") await utils.public.exploreForms.invalidate();
        break;
      case "user":
        if (procedure === "getEmailPreferences") await utils.user.getEmailPreferences.invalidate();
        break;
    }
  };

  const resetAuthMe = () => utils.auth.me.reset();

  return { invalidateCache, resetAuthMe };
};
