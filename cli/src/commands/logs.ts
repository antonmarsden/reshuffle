import Command from '../utils/command';
import flags from '../utils/cli-flags';
import {
  getProjectRootDir,
  Project,
} from '../utils/helpers';
import ms = require('ms');

const detailedLogsRegexps = [
  /^Function invocation took [\d.]+(e[-+]?\d+)? us$/m,
  /^Function \w+ deployed \(version digest: [0-9a-f]+\)$/m,
];

export default class Logs extends Command {
  public static description = 'show logs';

  public static examples = [
`// retrieve all logs (except "function invocation")
$ ${Command.cliBinName} logs
`,
`// retrieve all logs (including "function invocation")
$ ${Command.cliBinName} logs --all
`,
`// tail all logs
$ ${Command.cliBinName} logs --follow
`,
`// retrieve logs of specific app
$ ${Command.cliBinName} logs cool-dragon-17
`,
`// ISO
$ ${Command.cliBinName} logs --since 2018-03-09T22:12:21.861Z
`,
`// offset format
$ ${Command.cliBinName} logs --since 3d
$ ${Command.cliBinName} logs --since 13hours
$ ${Command.cliBinName} logs --since 9s
`,
`// show all logs from 2 minutes ago and follow in real time
$ ${Command.cliBinName} logs --since 2m --follow`,
];

  public static flags = {
    ...Command.flags,
    limit: flags.minMaxInt({
      char: 'l',
      description: 'Limit number of entries shown (cannot exceed 1000).',
      default: 500,
      min: 1,
      max: 1000,
    }),
    follow: flags.boolean({
      char: 'f',
      description: 'Follow log output like "tail -f".',
      default: false,
    }),
    since: flags.durationOrISO8601({
      char: 's',
      description: 'Output logs since the given ISO 8601 timestamp or time period.',
      default: '1m',
    }),
    all: flags.boolean({
      char: 'a',
      description: 'Include detailed function deployment and invocation timings',
      default: false,
    }),
  };

  public static args = [
    {
      name: 'name',
      required: false,
      description: 'Application name (defaults to working directory\'s deployed application name)',
    },
  ];

  public static strict = true;

  public async run() {
    const {
      flags: { since, follow, limit, all },
      args: { name: appName },
    } = this.parse(Logs);
    await this.authenticate();

    let applicationId: string | undefined;
    let env: string | undefined;
    if (appName === undefined) {
      const projectDir = await getProjectRootDir();
      const projects = this.conf.get('projects') as Project[] | undefined || [];
      const project = projects.find(({ directory }) => directory === projectDir);
      if (project === undefined) {
        return this.error(`No project deployments found, please run ${Command.cliBinName} deploy`);
      }
      applicationId = project.applicationId;
      env = project.defaultEnv;
    } else {
      try {
        const application = await this.lycanClient.getAppByName(appName);
        applicationId = application.id;
        env = application.environments[0].name;
      } catch (e) {
        return this.error(`Cannot find application ${appName}`);
      }
    }
    let token: string | undefined;
    let currentLimit = limit!;
    do {
      // TODO: support other envs
      const sinceDate = typeof since === 'string' ? new Date(Date.now() - ms(since)) : since;
      const { records, nextToken } = await this.lycanClient.getLogs(
        applicationId, env,
        { follow, limit: currentLimit, since: sinceDate, nextToken: token });

      // TODO: fix EOL, multiple sources, formatting
      for (const record of records) {
        if (all || detailedLogsRegexps.every((regexp) => !record.msg.match(regexp))) {
          process.stdout.write(record.msg);
        }
      }
      token = nextToken;
      currentLimit -= records.length;
    } while (token && currentLimit > 0);
  }
}
