"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeHandlerType = exports.SubstrateParachain = exports.ResourceType = void 0;
var ResourceType;
(function (ResourceType) {
    ResourceType["FUNGIBLE"] = "fungible";
    ResourceType["NON_FUNGIBLE"] = "nonfungible";
    ResourceType["PERMISSIONED_GENERIC"] = "permissionedGeneric";
    ResourceType["PERMISSIONLESS_GENERIC"] = "permissionlessGeneric";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
var SubstrateParachain;
(function (SubstrateParachain) {
    SubstrateParachain[SubstrateParachain["LOCAL"] = 5] = "LOCAL";
    SubstrateParachain[SubstrateParachain["ROCOCO_PHALA"] = 5231] = "ROCOCO_PHALA";
})(SubstrateParachain || (exports.SubstrateParachain = SubstrateParachain = {}));
var FeeHandlerType;
(function (FeeHandlerType) {
    FeeHandlerType["DYNAMIC"] = "oracle";
    FeeHandlerType["BASIC"] = "basic";
    FeeHandlerType["PERCENTAGE"] = "percentage";
    FeeHandlerType["UNDEFINED"] = "undefined";
})(FeeHandlerType || (exports.FeeHandlerType = FeeHandlerType = {}));
//# sourceMappingURL=types.js.map