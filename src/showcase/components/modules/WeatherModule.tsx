import React from 'react';
import type { WeatherSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: WeatherSummary;
}

export default function WeatherModule({ data }: Props): React.ReactElement | null {
  if (!data || data.tempC === undefined) return null;

  return (
    <Module title="Weather" span={4}>
      <div className="weather-grid">
        <div className="mini">
          <span className="mini__value mini__value--aurora">{Math.round(data.tempC)}°C</span>
          <span className="mini__label">TEMP</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.weatherDescription}</span>
          <span className="mini__label">CONDITIONS</span>
        </div>
        <div className="mini">
          <span className="mini__value">{Math.round(data.windSpeedKph)} km/h</span>
          <span className="mini__label">WIND</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.windDirection}</span>
          <span className="mini__label">DIRECTION</span>
        </div>
      </div>
    </Module>
  );
}
