"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sre_controller_1 = require("../controllers/sre.controller");
const router = (0, express_1.Router)();
// POST /api/sre/deploy/:missionId
router.post('/deploy/:missionId', sre_controller_1.triggerDeploy);
// POST /api/sre/crash-report
router.post('/crash-report', sre_controller_1.reportCrash);
// POST /api/sre/sandbox/:missionId 
router.post('/sandbox/:missionId', sre_controller_1.startSandbox);
// GET /api/sre/sandbox/:missionId/status
router.get('/sandbox/:missionId/status', sre_controller_1.getSandboxStatus);
exports.default = router;
