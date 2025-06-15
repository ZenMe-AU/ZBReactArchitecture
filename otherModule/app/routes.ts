import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

const modules = import.meta.glob("../../reactRouter/app/routes.ts", { eager: true });
function resolveFilePath(file: string, modulePath: string) {
  const moduleParts = modulePath.split("/");
  moduleParts.pop();

  const fileParts = file.split("/");

  fileParts.forEach((part) => {
    if (part === "..") {
      moduleParts.pop();
    } else if (part !== ".") {
      moduleParts.push(part);
    }
  });

  return moduleParts.join("/");
}

function replaceFileField(obj: any, modulePath: string) {
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceFileField(item, modulePath));
  } else if (typeof obj === "object" && obj !== null) {
    const newObj = { ...obj };
    if (newObj.file) {
      newObj.file = resolveFilePath(newObj.file, modulePath);
    }
    if (Array.isArray(newObj.children)) {
      newObj.children = replaceFileField(newObj.children, modulePath);
    }
    return newObj;
  }
  return obj;
}

let routes: any[] = [];

for (const path in modules) {
  const mod = modules[path];
  const defaultExport = mod.default ?? [];

  // 修改 file 為完整路徑
  const updatedRoutes = replaceFileField(defaultExport, path);

  routes = routes.concat(updatedRoutes);
}
// routes = routes.slice(0, 2);
console.log("🔥 完整 routes 結果：", routes);

export default routes satisfies RouteConfig;

// export default [
//   // index("../../reactRouter/app/routes/HomePage.tsx")
//   index("../../reactRouter/app/routes/HomePage.tsx"),
//   // route("login", "./routes/HomePage.tsx"),
//   route("login", "../../reactRouter/app/routes/Login.tsx"),

//   layout("../../reactRouter/app/layouts/protected.tsx", [
//     route("logout", "../../reactRouter/app/routes/Logout.tsx"),
//     //     // route("question", "./routes/QuestionCombinationList.tsx"),
//     //     // route("/question/:id", "./routes/QuestionDetail.tsx"),
//     //     // route("/question/:id/add", "./routes/QuestionDetailAdd.tsx"),
//     //     // route("/question/:id/answer", "./routes/AnswerQuestion.tsx"),
//     //     // route("/question/:id/followUp", "./routes/FollowUpQuestion.tsx"),
//     //     // route("/question/:id/answer/:id", "./routes/AnswerQuestion.tsx"),
//     //     // route("/question/:id/answerList", "./routes/AnswerList.tsx"),
//     //     // route("/question/add", "./routes/AddQuestion.tsx"),
//     //     // route("/question/:id/edit", "./routes/EditQuestion.tsx"),
//     //     route("/question/:id/share", "../../reactRouter/app/routes/ShareQuestion.tsx"),
//     //     // route("/sharedQuestion", "./routes/SharedQuestionList.tsx"),

//     //     route("question", "../../reactRouter/pages/QuestionCombinationList.tsx"),
//     //     route("/question/:id", "../../reactRouter/pages/QuestionDetail.tsx"),
//     //     route("/question/:id/add", "../../reactRouter/pages/QuestionDetailAdd.tsx"),
//     //     route("/question/:id/answer", "../../reactRouter/pages/AnswerQuestion.tsx"),
//     //     route("/question/:id/followUp", "../../reactRouter/pages/FollowUpQuestion.tsx"),
//     //     // route("/question/:id/answer/:id", "../../reactRouter/pages/AnswerQuestion.tsx"),
//     //     route("/question/:id/answerList", "../../reactRouter/pages/AnswerList.tsx"),
//     //     route("/question/add", "../../reactRouter/pages/AddQuestion.tsx"),
//     //     route("/question/:id/edit", "../../reactRouter/pages/EditQuestion.tsx"),
//     //     // route("/question/:id/share", "../../reactRouter/pages/ShareQuestion.tsx"),
//     //     route("/sharedQuestion", "../../reactRouter/pages/SharedQuestionList.tsx"),
//     //     // route("logout", "./routes/logout.tsx"),
//   ]),
// ] satisfies RouteConfig;

// function resolveAndReplaceFile(modules: any, basePath = "") {
//   for (const path in modules) {
//     for (const key in modules[path]) {
//       const mod = modules[path][key];

//       if (mod && typeof mod === "object" && "file" in mod) {
//         // 清理 ./ 或 ../
//         const cleanedFile = mod.file.replace(/^(\.\/|\.\.\/)+/, "");
//         mod.file = basePath + cleanedFile;

//         // 如果有 children，遞迴處理
//         if (Array.isArray(mod.children)) {
//           mod.children.forEach((child: any, index: number) => {
//             mod.children[index] = resolveAndReplaceFile({ [path]: { [key]: child } }, basePath)[path][key];
//           });
//         }
//       }
//     }
//   }
//   return modules;
// }
