"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditor_controller_1 = require("../controllers/auditor.controller");
const router = (0, express_1.Router)();
// POST /api/auditor/start/:missionId
router.post('/start/:missionId', auditor_controller_1.triggerAuditor);
exports.default = router;
