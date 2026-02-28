"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sre_controller_1 = require("../controllers/sre.controller");
const router = (0, express_1.Router)();
// POST /api/sre/deploy/:missionId
router.post('/deploy/:missionId', sre_controller_1.triggerDeploy);
exports.default = router;
