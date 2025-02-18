"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/stripe/create-checkout/route";
exports.ids = ["app/api/stripe/create-checkout/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Fcreate-checkout%2Froute&page=%2Fapi%2Fstripe%2Fcreate-checkout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Fcreate-checkout%2Froute.ts&appDir=C%3A%5CUsers%5CTrick%5COneDrive%5CPictures%5Cstudymind%20finished%20pre%20mobile%20optimize%5Cproject%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CTrick%5COneDrive%5CPictures%5Cstudymind%20finished%20pre%20mobile%20optimize%5Cproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Fcreate-checkout%2Froute&page=%2Fapi%2Fstripe%2Fcreate-checkout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Fcreate-checkout%2Froute.ts&appDir=C%3A%5CUsers%5CTrick%5COneDrive%5CPictures%5Cstudymind%20finished%20pre%20mobile%20optimize%5Cproject%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CTrick%5COneDrive%5CPictures%5Cstudymind%20finished%20pre%20mobile%20optimize%5Cproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Trick_OneDrive_Pictures_studymind_finished_pre_mobile_optimize_project_app_api_stripe_create_checkout_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/stripe/create-checkout/route.ts */ \"(rsc)/./app/api/stripe/create-checkout/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/stripe/create-checkout/route\",\n        pathname: \"/api/stripe/create-checkout\",\n        filename: \"route\",\n        bundlePath: \"app/api/stripe/create-checkout/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Trick\\\\OneDrive\\\\Pictures\\\\studymind finished pre mobile optimize\\\\project\\\\app\\\\api\\\\stripe\\\\create-checkout\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Trick_OneDrive_Pictures_studymind_finished_pre_mobile_optimize_project_app_api_stripe_create_checkout_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/stripe/create-checkout/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzdHJpcGUlMkZjcmVhdGUtY2hlY2tvdXQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnN0cmlwZSUyRmNyZWF0ZS1jaGVja291dCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnN0cmlwZSUyRmNyZWF0ZS1jaGVja291dCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNUcmljayU1Q09uZURyaXZlJTVDUGljdHVyZXMlNUNzdHVkeW1pbmQlMjBmaW5pc2hlZCUyMHByZSUyMG1vYmlsZSUyMG9wdGltaXplJTVDcHJvamVjdCU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDVHJpY2slNUNPbmVEcml2ZSU1Q1BpY3R1cmVzJTVDc3R1ZHltaW5kJTIwZmluaXNoZWQlMjBwcmUlMjBtb2JpbGUlMjBvcHRpbWl6ZSU1Q3Byb2plY3QmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDa0Y7QUFDL0o7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUM2Sjs7QUFFN0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXh0anMvPzZiNTQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcVHJpY2tcXFxcT25lRHJpdmVcXFxcUGljdHVyZXNcXFxcc3R1ZHltaW5kIGZpbmlzaGVkIHByZSBtb2JpbGUgb3B0aW1pemVcXFxccHJvamVjdFxcXFxhcHBcXFxcYXBpXFxcXHN0cmlwZVxcXFxjcmVhdGUtY2hlY2tvdXRcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3N0cmlwZS9jcmVhdGUtY2hlY2tvdXQvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9zdHJpcGUvY3JlYXRlLWNoZWNrb3V0XCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9zdHJpcGUvY3JlYXRlLWNoZWNrb3V0L3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcVHJpY2tcXFxcT25lRHJpdmVcXFxcUGljdHVyZXNcXFxcc3R1ZHltaW5kIGZpbmlzaGVkIHByZSBtb2JpbGUgb3B0aW1pemVcXFxccHJvamVjdFxcXFxhcHBcXFxcYXBpXFxcXHN0cmlwZVxcXFxjcmVhdGUtY2hlY2tvdXRcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0IH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvc3RyaXBlL2NyZWF0ZS1jaGVja291dC9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Fcreate-checkout%2Froute&page=%2Fapi%2Fstripe%2Fcreate-checkout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Fcreate-checkout%2Froute.ts&appDir=C%3A%5CUsers%5CTrick%5COneDrive%5CPictures%5Cstudymind%20finished%20pre%20mobile%20optimize%5Cproject%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CTrick%5COneDrive%5CPictures%5Cstudymind%20finished%20pre%20mobile%20optimize%5Cproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/stripe/create-checkout/route.ts":
/*!*************************************************!*\
  !*** ./app/api/stripe/create-checkout/route.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var _lib_stripe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/stripe */ \"(rsc)/./lib/stripe.ts\");\n/* harmony import */ var next_auth_next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/next */ \"(rsc)/./node_modules/next-auth/next/index.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n\n\n\n\nasync function POST(req) {\n    try {\n        const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session?.user) {\n            return new next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_3__[\"default\"](\"Unauthorized\", {\n                status: 401\n            });\n        }\n        const { planId } = await req.json();\n        const plan = _lib_stripe__WEBPACK_IMPORTED_MODULE_0__.PLANS[planId];\n        if (!plan) {\n            return new next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_3__[\"default\"](\"Invalid plan\", {\n                status: 400\n            });\n        }\n        // Create a checkout session\n        const stripeSession = await _lib_stripe__WEBPACK_IMPORTED_MODULE_0__.stripe.checkout.sessions.create({\n            success_url: `${\"http://localhost:3000\"}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,\n            cancel_url: `${\"http://localhost:3000\"}/pricing?canceled=true`,\n            customer_email: session.user.email,\n            mode: \"subscription\",\n            payment_method_types: [\n                \"card\"\n            ],\n            billing_address_collection: \"required\",\n            line_items: [\n                {\n                    price: plan.priceId,\n                    quantity: 1\n                }\n            ],\n            metadata: {\n                userId: session.user.id,\n                planId\n            },\n            subscription_data: {\n                metadata: {\n                    userId: session.user.id,\n                    planId\n                }\n            },\n            allow_promotion_codes: true\n        });\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_3__[\"default\"].json({\n            url: stripeSession.url\n        });\n    } catch (error) {\n        console.error(\"Error in create-checkout:\", error);\n        return new next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_3__[\"default\"](\"Internal error\", {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3N0cmlwZS9jcmVhdGUtY2hlY2tvdXQvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBNkM7QUFDSztBQUNUO0FBQ0U7QUFFcEMsZUFBZUssS0FBS0MsR0FBWTtJQUNyQyxJQUFJO1FBQ0YsTUFBTUMsVUFBVSxNQUFNTCxnRUFBZ0JBLENBQUNDLGtEQUFXQTtRQUVsRCxJQUFJLENBQUNJLFNBQVNDLE1BQU07WUFDbEIsT0FBTyxJQUFJSixrRkFBWUEsQ0FBQyxnQkFBZ0I7Z0JBQUVLLFFBQVE7WUFBSTtRQUN4RDtRQUVBLE1BQU0sRUFBRUMsTUFBTSxFQUFFLEdBQUcsTUFBTUosSUFBSUssSUFBSTtRQUNqQyxNQUFNQyxPQUFPWCw4Q0FBSyxDQUFDUyxPQUE2QjtRQUVoRCxJQUFJLENBQUNFLE1BQU07WUFDVCxPQUFPLElBQUlSLGtGQUFZQSxDQUFDLGdCQUFnQjtnQkFBRUssUUFBUTtZQUFJO1FBQ3hEO1FBRUEsNEJBQTRCO1FBQzVCLE1BQU1JLGdCQUFnQixNQUFNYiwrQ0FBTUEsQ0FBQ2MsUUFBUSxDQUFDQyxRQUFRLENBQUNDLE1BQU0sQ0FBQztZQUMxREMsYUFBYSxDQUFDLEVBQUVDLHVCQUErQixDQUFDLHdEQUF3RCxDQUFDO1lBQ3pHRyxZQUFZLENBQUMsRUFBRUgsdUJBQStCLENBQUMsc0JBQXNCLENBQUM7WUFDdEVJLGdCQUFnQmYsUUFBUUMsSUFBSSxDQUFDZSxLQUFLO1lBQ2xDQyxNQUFNO1lBQ05DLHNCQUFzQjtnQkFBQzthQUFPO1lBQzlCQyw0QkFBNEI7WUFDNUJDLFlBQVk7Z0JBQ1Y7b0JBQ0VDLE9BQU9oQixLQUFLaUIsT0FBTztvQkFDbkJDLFVBQVU7Z0JBQ1o7YUFDRDtZQUNEQyxVQUFVO2dCQUNSQyxRQUFRekIsUUFBUUMsSUFBSSxDQUFDeUIsRUFBRTtnQkFDdkJ2QjtZQUNGO1lBQ0F3QixtQkFBbUI7Z0JBQ2pCSCxVQUFVO29CQUNSQyxRQUFRekIsUUFBUUMsSUFBSSxDQUFDeUIsRUFBRTtvQkFDdkJ2QjtnQkFDRjtZQUNGO1lBQ0F5Qix1QkFBdUI7UUFDekI7UUFFQSxPQUFPL0Isa0ZBQVlBLENBQUNPLElBQUksQ0FBQztZQUFFeUIsS0FBS3ZCLGNBQWN1QixHQUFHO1FBQUM7SUFDcEQsRUFBRSxPQUFPQyxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyw2QkFBNkJBO1FBQzNDLE9BQU8sSUFBSWpDLGtGQUFZQSxDQUFDLGtCQUFrQjtZQUFFSyxRQUFRO1FBQUk7SUFDMUQ7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL25leHRqcy8uL2FwcC9hcGkvc3RyaXBlL2NyZWF0ZS1jaGVja291dC9yb3V0ZS50cz9hYWY3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHN0cmlwZSwgUExBTlMgfSBmcm9tICdAL2xpYi9zdHJpcGUnO1xyXG5pbXBvcnQgeyBnZXRTZXJ2ZXJTZXNzaW9uIH0gZnJvbSAnbmV4dC1hdXRoL25leHQnO1xyXG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJ0AvbGliL2F1dGgnO1xyXG5pbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IFJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpO1xyXG5cclxuICAgIGlmICghc2Vzc2lvbj8udXNlcikge1xyXG4gICAgICByZXR1cm4gbmV3IE5leHRSZXNwb25zZSgnVW5hdXRob3JpemVkJywgeyBzdGF0dXM6IDQwMSB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IHBsYW5JZCB9ID0gYXdhaXQgcmVxLmpzb24oKTtcclxuICAgIGNvbnN0IHBsYW4gPSBQTEFOU1twbGFuSWQgYXMga2V5b2YgdHlwZW9mIFBMQU5TXTtcclxuXHJcbiAgICBpZiAoIXBsYW4pIHtcclxuICAgICAgcmV0dXJuIG5ldyBOZXh0UmVzcG9uc2UoJ0ludmFsaWQgcGxhbicsIHsgc3RhdHVzOiA0MDAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgY2hlY2tvdXQgc2Vzc2lvblxyXG4gICAgY29uc3Qgc3RyaXBlU2Vzc2lvbiA9IGF3YWl0IHN0cmlwZS5jaGVja291dC5zZXNzaW9ucy5jcmVhdGUoe1xyXG4gICAgICBzdWNjZXNzX3VybDogYCR7cHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfQVBQX1VSTH0vZGFzaGJvYXJkP3N1Y2Nlc3M9dHJ1ZSZzZXNzaW9uX2lkPXtDSEVDS09VVF9TRVNTSU9OX0lEfWAsXHJcbiAgICAgIGNhbmNlbF91cmw6IGAke3Byb2Nlc3MuZW52Lk5FWFRfUFVCTElDX0FQUF9VUkx9L3ByaWNpbmc/Y2FuY2VsZWQ9dHJ1ZWAsXHJcbiAgICAgIGN1c3RvbWVyX2VtYWlsOiBzZXNzaW9uLnVzZXIuZW1haWwhLFxyXG4gICAgICBtb2RlOiAnc3Vic2NyaXB0aW9uJyxcclxuICAgICAgcGF5bWVudF9tZXRob2RfdHlwZXM6IFsnY2FyZCddLFxyXG4gICAgICBiaWxsaW5nX2FkZHJlc3NfY29sbGVjdGlvbjogJ3JlcXVpcmVkJyxcclxuICAgICAgbGluZV9pdGVtczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHByaWNlOiBwbGFuLnByaWNlSWQsXHJcbiAgICAgICAgICBxdWFudGl0eTogMSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgIHVzZXJJZDogc2Vzc2lvbi51c2VyLmlkLFxyXG4gICAgICAgIHBsYW5JZCxcclxuICAgICAgfSxcclxuICAgICAgc3Vic2NyaXB0aW9uX2RhdGE6IHtcclxuICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgdXNlcklkOiBzZXNzaW9uLnVzZXIuaWQsXHJcbiAgICAgICAgICBwbGFuSWQsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgYWxsb3dfcHJvbW90aW9uX2NvZGVzOiB0cnVlLFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgdXJsOiBzdHJpcGVTZXNzaW9uLnVybCB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gY3JlYXRlLWNoZWNrb3V0OicsIGVycm9yKTtcclxuICAgIHJldHVybiBuZXcgTmV4dFJlc3BvbnNlKCdJbnRlcm5hbCBlcnJvcicsIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgfVxyXG59ICJdLCJuYW1lcyI6WyJzdHJpcGUiLCJQTEFOUyIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsIk5leHRSZXNwb25zZSIsIlBPU1QiLCJyZXEiLCJzZXNzaW9uIiwidXNlciIsInN0YXR1cyIsInBsYW5JZCIsImpzb24iLCJwbGFuIiwic3RyaXBlU2Vzc2lvbiIsImNoZWNrb3V0Iiwic2Vzc2lvbnMiLCJjcmVhdGUiLCJzdWNjZXNzX3VybCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19BUFBfVVJMIiwiY2FuY2VsX3VybCIsImN1c3RvbWVyX2VtYWlsIiwiZW1haWwiLCJtb2RlIiwicGF5bWVudF9tZXRob2RfdHlwZXMiLCJiaWxsaW5nX2FkZHJlc3NfY29sbGVjdGlvbiIsImxpbmVfaXRlbXMiLCJwcmljZSIsInByaWNlSWQiLCJxdWFudGl0eSIsIm1ldGFkYXRhIiwidXNlcklkIiwiaWQiLCJzdWJzY3JpcHRpb25fZGF0YSIsImFsbG93X3Byb21vdGlvbl9jb2RlcyIsInVybCIsImVycm9yIiwiY29uc29sZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/stripe/create-checkout/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID,\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET\n        })\n    ],\n    callbacks: {\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.sub;\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/auth/signin\"\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC50cyIsIm1hcHBpbmdzIjoiOzs7OztBQUN3RDtBQUVqRCxNQUFNQyxjQUErQjtJQUMxQ0MsV0FBVztRQUNURixzRUFBY0EsQ0FBQztZQUNiRyxVQUFVQyxRQUFRQyxHQUFHLENBQUNDLGdCQUFnQjtZQUN0Q0MsY0FBY0gsUUFBUUMsR0FBRyxDQUFDRyxvQkFBb0I7UUFDaEQ7S0FDRDtJQUNEQyxXQUFXO1FBQ1QsTUFBTUMsU0FBUSxFQUFFQSxPQUFPLEVBQUVDLEtBQUssRUFBRTtZQUM5QixJQUFJRCxRQUFRRSxJQUFJLEVBQUU7Z0JBQ2hCRixRQUFRRSxJQUFJLENBQUNDLEVBQUUsR0FBR0YsTUFBTUcsR0FBRztZQUM3QjtZQUNBLE9BQU9KO1FBQ1Q7SUFDRjtJQUNBSyxPQUFPO1FBQ0xDLFFBQVE7SUFDVjtBQUNGLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXh0anMvLi9saWIvYXV0aC50cz9iZjdlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRBdXRoT3B0aW9ucyB9IGZyb20gXCJuZXh0LWF1dGhcIjtcclxuaW1wb3J0IEdvb2dsZVByb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2dvb2dsZVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zOiBOZXh0QXV0aE9wdGlvbnMgPSB7XHJcbiAgcHJvdmlkZXJzOiBbXHJcbiAgICBHb29nbGVQcm92aWRlcih7XHJcbiAgICAgIGNsaWVudElkOiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEISxcclxuICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX1NFQ1JFVCEsXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIGNhbGxiYWNrczoge1xyXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcclxuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xyXG4gICAgICAgIHNlc3Npb24udXNlci5pZCA9IHRva2VuLnN1YjtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc2Vzc2lvbjtcclxuICAgIH0sXHJcbiAgfSxcclxuICBwYWdlczoge1xyXG4gICAgc2lnbkluOiAnL2F1dGgvc2lnbmluJyxcclxuICB9LFxyXG59OyAiXSwibmFtZXMiOlsiR29vZ2xlUHJvdmlkZXIiLCJhdXRoT3B0aW9ucyIsInByb3ZpZGVycyIsImNsaWVudElkIiwicHJvY2VzcyIsImVudiIsIkdPT0dMRV9DTElFTlRfSUQiLCJjbGllbnRTZWNyZXQiLCJHT09HTEVfQ0xJRU5UX1NFQ1JFVCIsImNhbGxiYWNrcyIsInNlc3Npb24iLCJ0b2tlbiIsInVzZXIiLCJpZCIsInN1YiIsInBhZ2VzIiwic2lnbkluIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/stripe.ts":
/*!***********************!*\
  !*** ./lib/stripe.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   PLANS: () => (/* binding */ PLANS),\n/* harmony export */   stripe: () => (/* binding */ stripe)\n/* harmony export */ });\n/* harmony import */ var stripe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! stripe */ \"(rsc)/./node_modules/stripe/esm/stripe.esm.node.js\");\n\nconst stripe = new stripe__WEBPACK_IMPORTED_MODULE_0__[\"default\"](process.env.STRIPE_SECRET_KEY, {\n    apiVersion: \"2023-10-16\",\n    typescript: true\n});\nconst PLANS = {\n    basic: {\n        priceId: process.env.STRIPE_BASIC_PRICE_ID,\n        name: \"Basic\",\n        price: 1.99,\n        interval: \"week\",\n        currency: \"gbp\",\n        features: [\n            \"20 Summarised Video lectures\",\n            \"20 Flashcard Sets (300)\",\n            \"40 Text humanizations\",\n            \"B1 Generation Speed\"\n        ]\n    },\n    pro: {\n        priceId: process.env.STRIPE_PRO_PRICE_ID,\n        name: \"Pro\",\n        price: 3.99,\n        interval: \"week\",\n        currency: \"gbp\",\n        features: [\n            \"1000 Summarised Video Lectures\",\n            \"1000 FlashCard Sets (15k)\",\n            \"500 Text Humanizations\",\n            \"A1-Super Generation Speed\"\n        ]\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3RyaXBlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE0QjtBQUVyQixNQUFNQyxTQUFTLElBQUlELDhDQUFNQSxDQUFDRSxRQUFRQyxHQUFHLENBQUNDLGlCQUFpQixFQUFHO0lBQy9EQyxZQUFZO0lBQ1pDLFlBQVk7QUFDZCxHQUFHO0FBRUksTUFBTUMsUUFBUTtJQUNuQkMsT0FBTztRQUNMQyxTQUFTUCxRQUFRQyxHQUFHLENBQUNPLHFCQUFxQjtRQUMxQ0MsTUFBTTtRQUNOQyxPQUFPO1FBQ1BDLFVBQVU7UUFDVkMsVUFBVTtRQUNWQyxVQUFVO1lBQ1I7WUFDQTtZQUNBO1lBQ0E7U0FDRDtJQUNIO0lBQ0FDLEtBQUs7UUFDSFAsU0FBU1AsUUFBUUMsR0FBRyxDQUFDYyxtQkFBbUI7UUFDeENOLE1BQU07UUFDTkMsT0FBTztRQUNQQyxVQUFVO1FBQ1ZDLFVBQVU7UUFDVkMsVUFBVTtZQUNSO1lBQ0E7WUFDQTtZQUNBO1NBQ0Q7SUFDSDtBQUNGLEVBQVciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXh0anMvLi9saWIvc3RyaXBlLnRzPzBlMzMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFN0cmlwZSBmcm9tICdzdHJpcGUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0cmlwZSA9IG5ldyBTdHJpcGUocHJvY2Vzcy5lbnYuU1RSSVBFX1NFQ1JFVF9LRVkhLCB7XHJcbiAgYXBpVmVyc2lvbjogJzIwMjMtMTAtMTYnLFxyXG4gIHR5cGVzY3JpcHQ6IHRydWUsXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBMQU5TID0ge1xyXG4gIGJhc2ljOiB7XHJcbiAgICBwcmljZUlkOiBwcm9jZXNzLmVudi5TVFJJUEVfQkFTSUNfUFJJQ0VfSUQhLFxyXG4gICAgbmFtZTogJ0Jhc2ljJyxcclxuICAgIHByaWNlOiAxLjk5LFxyXG4gICAgaW50ZXJ2YWw6ICd3ZWVrJyxcclxuICAgIGN1cnJlbmN5OiAnZ2JwJyxcclxuICAgIGZlYXR1cmVzOiBbXHJcbiAgICAgIFwiMjAgU3VtbWFyaXNlZCBWaWRlbyBsZWN0dXJlc1wiLFxyXG4gICAgICBcIjIwIEZsYXNoY2FyZCBTZXRzICgzMDApXCIsXHJcbiAgICAgIFwiNDAgVGV4dCBodW1hbml6YXRpb25zXCIsXHJcbiAgICAgIFwiQjEgR2VuZXJhdGlvbiBTcGVlZFwiXHJcbiAgICBdXHJcbiAgfSxcclxuICBwcm86IHtcclxuICAgIHByaWNlSWQ6IHByb2Nlc3MuZW52LlNUUklQRV9QUk9fUFJJQ0VfSUQhLFxyXG4gICAgbmFtZTogJ1BybycsXHJcbiAgICBwcmljZTogMy45OSxcclxuICAgIGludGVydmFsOiAnd2VlaycsXHJcbiAgICBjdXJyZW5jeTogJ2dicCcsXHJcbiAgICBmZWF0dXJlczogW1xyXG4gICAgICBcIjEwMDAgU3VtbWFyaXNlZCBWaWRlbyBMZWN0dXJlc1wiLFxyXG4gICAgICBcIjEwMDAgRmxhc2hDYXJkIFNldHMgKDE1aylcIixcclxuICAgICAgXCI1MDAgVGV4dCBIdW1hbml6YXRpb25zXCIsXHJcbiAgICAgIFwiQTEtU3VwZXIgR2VuZXJhdGlvbiBTcGVlZFwiXHJcbiAgICBdXHJcbiAgfVxyXG59IGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IHR5cGUgUGxhblR5cGUgPSBrZXlvZiB0eXBlb2YgUExBTlM7ICJdLCJuYW1lcyI6WyJTdHJpcGUiLCJzdHJpcGUiLCJwcm9jZXNzIiwiZW52IiwiU1RSSVBFX1NFQ1JFVF9LRVkiLCJhcGlWZXJzaW9uIiwidHlwZXNjcmlwdCIsIlBMQU5TIiwiYmFzaWMiLCJwcmljZUlkIiwiU1RSSVBFX0JBU0lDX1BSSUNFX0lEIiwibmFtZSIsInByaWNlIiwiaW50ZXJ2YWwiLCJjdXJyZW5jeSIsImZlYXR1cmVzIiwicHJvIiwiU1RSSVBFX1BST19QUklDRV9JRCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/stripe.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/oidc-token-hash","vendor-chunks/@panva","vendor-chunks/stripe","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/qs","vendor-chunks/call-bind-apply-helpers","vendor-chunks/get-proto","vendor-chunks/object-inspect","vendor-chunks/has-symbols","vendor-chunks/gopd","vendor-chunks/function-bind","vendor-chunks/side-channel","vendor-chunks/side-channel-weakmap","vendor-chunks/side-channel-map","vendor-chunks/side-channel-list","vendor-chunks/hasown","vendor-chunks/get-intrinsic","vendor-chunks/es-object-atoms","vendor-chunks/es-define-property","vendor-chunks/dunder-proto","vendor-chunks/call-bound"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Fcreate-checkout%2Froute&page=%2Fapi%2Fstripe%2Fcreate-checkout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Fcreate-checkout%2Froute.ts&appDir=C%3A%5CUsers%5CTrick%5COneDrive%5CPictures%5Cstudymind%20finished%20pre%20mobile%20optimize%5Cproject%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CTrick%5COneDrive%5CPictures%5Cstudymind%20finished%20pre%20mobile%20optimize%5Cproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();