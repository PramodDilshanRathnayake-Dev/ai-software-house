"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const builder_controller_1 = require("../controllers/builder.controller");
const router = (0, express_1.Router)();
// POST /api/builder/start/:missionId
router.post('/start/:missionId', builder_controller_1.triggerBuilderSprint);
exports.default = router;
