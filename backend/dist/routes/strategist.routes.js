"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const strategist_controller_1 = require("../controllers/strategist.controller");
const router = (0, express_1.Router)();
// POST /api/strategist/intake
router.post('/intake', strategist_controller_1.handleClientIntake);
// GET /api/strategist/missions
router.get('/missions', strategist_controller_1.getMissionStatus);
// POST /api/strategist/missions/:projectId/discuss
router.post('/missions/:projectId/discuss', strategist_controller_1.handleMidSprintDiscussion);
exports.default = router;
