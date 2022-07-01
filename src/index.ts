import fs from 'fs';
import exec from 'child_process';
import util from 'util';
import { detailedDiff } from 'deep-object-diff';
import { getArgs } from './utils/processArgs';

const execAsync = util.promisify(exec.exec);

export type Dependency = { [key: string]: string };

export const getManageDependenciesCommand = (
  dependencies: Dependency,
  action: 'upgrade' | 'add',
): string => {
  const commandPrefix = `yarn ${action}`;
  const _dependencies = Object.keys(dependencies).reduce(
    (acc, dependency, index) => {
      const dependencyVersion = Object.values(dependencies)[index];
      const commandItem = acc + dependency + '@' + dependencyVersion + ' ';

      return commandItem;
    },
    '',
  );

  const installCommand = commandPrefix + ' ' + _dependencies;

  return installCommand;
};

export const getDependenciesChanges = (
  sourceDependencies: Dependency,
  targetDependencies: Dependency,
): { added: Dependency; updated: Dependency } => {
  const { added, updated } = detailedDiff(
    sourceDependencies,
    targetDependencies,
  ) as {
    added: string;
    updated: string;
  };

  return { added, updated } as unknown as {
    added: Dependency;
    updated: Dependency;
  };
};

const sync = async () => {
  const { source, target } = getArgs();

  const sourcePackage = fs.readFileSync(source, {
    encoding: 'utf-8',
  });

  const targetPackage = fs.readFileSync(target, {
    encoding: 'utf-8',
  });

  const _sourcePackage = JSON.parse(sourcePackage) as {
    dependencies: { string: string };
  };
  const _targetPackage = JSON.parse(targetPackage) as {
    dependencies: { string: string };
  };

  const { added: addedDependencies, updated: updatedDependencies } =
    getDependenciesChanges(
      _sourcePackage.dependencies,
      _targetPackage.dependencies,
    );

  const hasAddedDependencies = Object.keys(addedDependencies)?.length > 0;
  const hasUpdatedDependencies = Object.keys(updatedDependencies)?.length > 0;

  if (hasAddedDependencies) {
    const command = getManageDependenciesCommand(addedDependencies, 'add');

    console.log(`Running additions with the following command \n ${command}`);

    try {
      await execAsync(command);
    } catch (error) {
      console.log(error);
    }
  }

  if (hasUpdatedDependencies) {
    const command = getManageDependenciesCommand(
      updatedDependencies,
      'upgrade',
    );

    console.log(`Running updates with the following command \n ${command}`);

    try {
      await execAsync(command);
    } catch (error) {
      console.log(error);
    }
  }

  console.log('All packages up-to-dates sucessfuly');
};

sync();
