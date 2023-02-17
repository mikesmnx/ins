import * as moment from 'moment';

export class TimeHelper {
  public static getHoursFromMsec(duration: number): number {
    return moment.duration(duration).asHours();
  }

  public static getDate(timestamp: number): string {
    return moment(timestamp).format('MM/DD/YYYY');
  }

  public static getStartDayTimestamp(timestamp: number, dayDiff = 0): number {
    const date = moment(timestamp).add(dayDiff, 'days');

    return date.startOf('day').unix() * 1000;
  }

  public static getTime(timestamp: number): string {
    const date = new Date(timestamp);

    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  /**
   *
   * @param startOfDay timestamp - start of the day
   * @param time 'hh:mm' - time (hours/min)
   * @returns timestamp
   */
  public static getNewTimestamp(startOfDay: number, time: string): number {
    const [hour, min] = time.split(':');

    const newDate = moment(startOfDay).add(hour, 'hour').add(min, 'minute');

    return newDate.unix() * 1000;
  }
}
