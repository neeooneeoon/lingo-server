"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.RankingByTime = exports.Location = exports.Action = exports.ReportType = exports.QuestionTypeCode = exports.Account = exports.Role = exports.Rank = void 0;
var Rank;
(function (Rank) {
    Rank["Legend"] = "Legend";
    Rank["Diamond"] = "Diamond";
    Rank["Gold"] = "Gold";
    Rank["Silver"] = "Silver";
    Rank["Bronze"] = "Bronze";
    Rank["None"] = "None";
})(Rank = exports.Rank || (exports.Rank = {}));
var Role;
(function (Role) {
    Role["Member"] = "Member";
    Role["Admin"] = "Admin";
})(Role = exports.Role || (exports.Role = {}));
var Account;
(function (Account) {
    Account["Google"] = "Google";
    Account["Facebook"] = "Facebook";
    Account["Apple"] = "Apple";
})(Account = exports.Account || (exports.Account = {}));
var QuestionTypeCode;
(function (QuestionTypeCode) {
    QuestionTypeCode["W3"] = "P1-I1W2-C";
    QuestionTypeCode["W6"] = "P1-W1-C";
    QuestionTypeCode["W11"] = "P1-W1-W";
    QuestionTypeCode["W7"] = "P1I1-W1-W";
    QuestionTypeCode["W2"] = "P1W1-I1-C";
    QuestionTypeCode["W4"] = "W1-I1P1-C";
    QuestionTypeCode["W12"] = "P1W1-P1-V";
    QuestionTypeCode["W9"] = "W1-W2-M";
    QuestionTypeCode["W8"] = "W1-W2-W";
    QuestionTypeCode["W13"] = "W2-W1-C";
    QuestionTypeCode["W14"] = "W2-W1-W";
    QuestionTypeCode["W15"] = "W1-W2-C";
    QuestionTypeCode["S12"] = "S1-S2-R";
    QuestionTypeCode["S10"] = "S2-S1-C";
    QuestionTypeCode["S1"] = "A1-S1-R";
    QuestionTypeCode["S2"] = "S2-S1-R";
    QuestionTypeCode["S14"] = "A1-S1-W";
    QuestionTypeCode["S17"] = "S1-S1-R";
    QuestionTypeCode["S16"] = "A1S1-S2-W";
    QuestionTypeCode["S4"] = "A1S1-A1-V";
    QuestionTypeCode["S18"] = "S2-S1-W";
    QuestionTypeCode["S7"] = "A1-W1S1-C";
    QuestionTypeCode["S15"] = "A1-W1S1-W";
})(QuestionTypeCode = exports.QuestionTypeCode || (exports.QuestionTypeCode = {}));
var ReportType;
(function (ReportType) {
    ReportType["Question"] = "Question";
    ReportType["Security"] = "Security";
    ReportType["System"] = "System";
    ReportType["Theme"] = "Theme";
})(ReportType = exports.ReportType || (exports.ReportType = {}));
var Action;
(function (Action) {
    Action["Manage"] = "manage";
    Action["Create"] = "create";
    Action["Read"] = "read";
    Action["Update"] = "update";
    Action["Delete"] = "delete";
})(Action = exports.Action || (exports.Action = {}));
var Location;
(function (Location) {
    Location["Province"] = "Province";
    Location["District"] = "District";
    Location["School"] = "School";
    Location["Grade"] = "Grade";
    Location["All"] = "Nationwide";
})(Location = exports.Location || (exports.Location = {}));
var RankingByTime;
(function (RankingByTime) {
    RankingByTime["week"] = "week";
    RankingByTime["month"] = "month";
    RankingByTime["all"] = "all";
})(RankingByTime = exports.RankingByTime || (exports.RankingByTime = {}));
var Notification;
(function (Notification) {
    Notification["UpdateVersion"] = "UpdateVersion";
    Notification["DailyReminder"] = "DailyReminder";
    Notification["ScoreReminder"] = "ScoreReminder";
})(Notification = exports.Notification || (exports.Notification = {}));
//# sourceMappingURL=index.js.map