# Snapshot report for `src/test/lock.test.ts`

The actual snapshot is saved in `lock.test.ts.snap`.

Generated by [AVA](https://ava.li).

## appName not in project dir

> Snapshot 1

    {
      err: ` ›   Error: "appName" flag not provided and could not locate project settings␊
      `,
      exitCode: 2,
      out: '',
    }

## lockApp lock an application by appName

> Snapshot 1

    {
      err: '',
      exitCode: 0,
      out: `Application: abc successfully locked with, lock-my-app␊
      `,
    }

## missing application

> Snapshot 1

    {
      err: ` ›   Error: The current appName is not found␊
      `,
      exitCode: 2,
      out: '',
    }

## permission error

> Snapshot 1

    {
      err: ` ›   Error: no auth␊
      `,
      exitCode: 2,
      out: '',
    }

## too many args

> Snapshot 1

    {
      err: ` ›   Error: Unexpected argument: extra-extra-org␊
       ›   See more help with --help␊
      `,
      exitCode: 2,
      out: '',
    }

## lock command fails when app name not in local project dir

> Snapshot 1

    {
      err: ` ›   Error: "appName" flag not provided and could not locate project settings␊
      `,
      exitCode: 2,
      out: '',
    }

## lock command fails when too many args specified

> Snapshot 1

    {
      err: ` ›   Error: Unexpected argument: extra-extra-arg␊
       ›   See more help with --help␊
      `,
      exitCode: 2,
      out: '',
    }

## lock command throws NotFoundError when given app name not found

> Snapshot 1

    {
      err: ` ›   Error: The current appName is not found␊
      `,
      exitCode: 2,
      out: '',
    }

## lock command throws UnauthorizedError if no permission

> Snapshot 1

    {
      err: ` ›   Error: no auth␊
      `,
      exitCode: 2,
      out: '',
    }

## lockApp locks a unlocked application by given app name and lock reason

> Snapshot 1

    {
      err: '',
      exitCode: 0,
      out: `Application: abc successfully locked with, lock-my-app␊
      `,
    }