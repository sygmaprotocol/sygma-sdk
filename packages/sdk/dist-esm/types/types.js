export var ResourceType;
(function (ResourceType) {
    ResourceType["FUNGIBLE"] = "fungible";
    ResourceType["NON_FUNGIBLE"] = "nonfungible";
    ResourceType["PERMISSIONED_GENERIC"] = "permissionedGeneric";
    ResourceType["PERMISSIONLESS_GENERIC"] = "permissionlessGeneric";
})(ResourceType || (ResourceType = {}));
export var SubstrateParachain;
(function (SubstrateParachain) {
    SubstrateParachain[SubstrateParachain["LOCAL"] = 5] = "LOCAL";
    SubstrateParachain[SubstrateParachain["ROCOCO_PHALA"] = 5231] = "ROCOCO_PHALA";
})(SubstrateParachain || (SubstrateParachain = {}));
export var FeeHandlerType;
(function (FeeHandlerType) {
    FeeHandlerType["DYNAMIC"] = "oracle";
    FeeHandlerType["BASIC"] = "basic";
    FeeHandlerType["PERCENTAGE"] = "percentage";
    FeeHandlerType["UNDEFINED"] = "undefined";
})(FeeHandlerType || (FeeHandlerType = {}));
//# sourceMappingURL=types.js.map