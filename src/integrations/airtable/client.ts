// This is a mock API file for Airtable.
// In a real application, you would use a library like `axios` or `fetch` to
// make API calls to your Airtable base.

// To use this, you would need to install Airtable's official JS client or another HTTP client.
// `npm install airtable`

// Example of a real client using the official library:
// import Airtable from 'airtable';
// import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from '@/constants';
// export const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// For this conversion, we'll use a mock client with in-memory data.
// Replace this with your actual Airtable client logic.
import {
  MOCK_REMINDERS_DATA,
  MOCK_USER_PROFILES_DATA,
} from './mock-data';

const getRecords = (tableName: string, filter?: (record: any) => boolean) => {
  let records = [];
  if (tableName === 'reminders') {
    records = MOCK_REMINDERS_DATA;
  } else if (tableName === 'user_profiles') {
    records = MOCK_USER_PROFILES_DATA;
  }

  if (filter) {
    return records.filter(filter);
  }
  return records;
};

const findRecord = (tableName: string, id: string) => {
  const records = getRecords(tableName);
  return records.find(record => record.id === id);
};

const createRecord = (tableName: string, data: any) => {
  const records = getRecords(tableName);
  const newRecord = { ...data, id: `rec${Math.random().toString(36).substring(2, 11)}` };
  if (tableName === 'reminders') {
    MOCK_REMINDERS_DATA.push(newRecord);
  } else if (tableName === 'user_profiles') {
    MOCK_USER_PROFILES_DATA.push(newRecord);
  }
  return newRecord;
};

const updateRecord = (tableName: string, id: string, data: any) => {
  const records = getRecords(tableName);
  const index = records.findIndex(record => record.id === id);
  if (index !== -1) {
    const updatedRecord = { ...records[index], ...data };
    records[index] = updatedRecord;
    return updatedRecord;
  }
  return null;
};

export const airtable = {
  getRecords,
  findRecord,
  createRecord,
  updateRecord,
};