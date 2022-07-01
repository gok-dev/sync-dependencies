"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDependenciesChanges = exports.getManageDependenciesCommand = void 0;
const fs_1 = __importDefault(require("fs"));
const child_process_1 = __importDefault(require("child_process"));
const util_1 = __importDefault(require("util"));
const deep_object_diff_1 = require("deep-object-diff");
const processArgs_1 = require("./utils/processArgs");
const execAsync = util_1.default.promisify(child_process_1.default.exec);
const getManageDependenciesCommand = (dependencies, action) => {
    const commandPrefix = `yarn ${action}`;
    const _dependencies = Object.keys(dependencies).reduce((acc, dependency, index) => {
        const dependencyVersion = Object.values(dependencies)[index];
        const commandItem = acc + dependency + '@' + dependencyVersion + ' ';
        return commandItem;
    }, '');
    const installCommand = commandPrefix + ' ' + _dependencies;
    return installCommand;
};
exports.getManageDependenciesCommand = getManageDependenciesCommand;
const getDependenciesChanges = (sourceDependencies, targetDependencies) => {
    const { added, updated } = (0, deep_object_diff_1.detailedDiff)(sourceDependencies, targetDependencies);
    return { added, updated };
};
exports.getDependenciesChanges = getDependenciesChanges;
const sync = async () => {
    const { source, target } = (0, processArgs_1.getArgs)();
    const sourcePackage = fs_1.default.readFileSync(source, {
        encoding: 'utf-8',
    });
    const targetPackage = fs_1.default.readFileSync(target, {
        encoding: 'utf-8',
    });
    const _sourcePackage = JSON.parse(sourcePackage);
    const _targetPackage = JSON.parse(targetPackage);
    const { added: addedDependencies, updated: updatedDependencies } = (0, exports.getDependenciesChanges)(_sourcePackage.dependencies, _targetPackage.dependencies);
    const hasAddedDependencies = Object.keys(addedDependencies)?.length > 0;
    const hasUpdatedDependencies = Object.keys(updatedDependencies)?.length > 0;
    if (hasAddedDependencies) {
        const command = (0, exports.getManageDependenciesCommand)(addedDependencies, 'add');
        console.log(`Running additions with the following command \n ${command}`);
        try {
            await execAsync(command);
        }
        catch (error) {
            console.log(error);
        }
    }
    if (hasUpdatedDependencies) {
        const command = (0, exports.getManageDependenciesCommand)(updatedDependencies, 'upgrade');
        console.log(`Running updates with the following command \n ${command}`);
        try {
            await execAsync(command);
        }
        catch (error) {
            console.log(error);
        }
    }
    console.log('All packages up-to-dates sucessfuly');
};
sync();
