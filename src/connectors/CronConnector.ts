import { BaseConnector, EventConfiguration } from 'reshuffle-base-connector'
import Timeout = NodeJS.Timeout
import Reshuffle from '../Reshuffle'

const DEFAULT_CRON_OPTIONS = { interval: 5000 }

export interface CronConnectorOptions {
  interval: number
}

export default class CronConnector extends BaseConnector<CronConnectorOptions> {
  intervalsByEventId: { [eventId: string]: Timeout }

  constructor(options: CronConnectorOptions = DEFAULT_CRON_OPTIONS, id: string) {
    super(options, id)
    this.intervalsByEventId = {}
  }

  on(options: CronConnectorOptions, eventId: string) {
    if (!eventId) {
      eventId = `CRON/${options.interval}/${this.id}`
    }

    const event = new EventConfiguration(eventId, this, options)
    this.eventConfigurations[event.id] = event

    // lazy run if already running
    if (this.started) {
      const intervalId = this.app.setInterval(() => {
        this.app.handleEvent(event.id)
      }, event.options.interval)
      this.intervalsByEventId[event.id] = intervalId
    }
    return event
  }

  onRemoveEvent(event: EventConfiguration) {
    clearInterval(this.intervalsByEventId[event.id])
  }

  onStart(app: Reshuffle) {
    Object.values(this.eventConfigurations).forEach((eventConfiguration) => {
      const intervalId = this.app.setInterval(() => {
        this.app.handleEvent(eventConfiguration.id, {})
      }, eventConfiguration.options.interval)
      this.intervalsByEventId[eventConfiguration.id] = intervalId
    })
  }

  onStop() {
    Object.values((intervalId: Timeout) => clearInterval(intervalId))
  }
}
