import * as moment from 'moment';

import { Pipe, PipeTransform } from '@angular/core';
import { DurationType } from '../models/duration-type';

@Pipe({
  name: 'duration',
  pure: true,
})
export class DurationPipe implements PipeTransform {
  transform(value: number, showAs: DurationType = DurationType.Hours): string {
    const duration = moment.duration(value);
    let result = 0;

    if (showAs === DurationType.Minutes) {
      result = duration.asMinutes();
    } else if (showAs === DurationType.Seconds) {
      result = duration.asSeconds();
    } else if (showAs === DurationType.Hours) {
      result = duration.asHours();
    } else if (showAs === DurationType.Humanize) {
      const min = duration.minutes() ? ` ${duration.minutes()} min` : '';
      const day = duration.days() ? ` ${duration.days()} d ` : '';

      return `${day}${duration.hours()} hr${min}`;
    }

    return (Math.round(result * 100) / 100).toString();
  }
}
