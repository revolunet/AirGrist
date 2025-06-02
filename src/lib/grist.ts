/**
 * Grist API Service
 * Handles all communications with the Grist API
 * Translated from grist_main.py
 */

export enum GristFieldType {
  TEXT = "Text",
  NUMERIC = "Numeric", 
  INT = "Int",
  DATE = "Date",
  DATETIME = "DateTime",
  BOOL = "Bool",
  CHOICE = "Choice",
  // Add more types as needed
}

export interface GristField {
  label: string;
  type: GristFieldType;
}

export interface GristColumn {
  id: string;
  fields: GristField; // Note: "fields" mirrors the Grist API but it's actually not a list
}

export interface GristTable {
  id: string; // The name of the table
  columns: GristColumn[];
}

export interface GristRecord {
  fields: Record<string, any>;
}

class GristApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'GristApiError';
  }
}

export class GristService {
  private baseUrl: string;
  private token: string;

  constructor(apiUrl: string, token: string) {
    if (!token || !token.trim()) {
      throw new Error('Grist API token is required');
    }
    if (!apiUrl || !apiUrl.trim()) {
      throw new Error('Grist API URL is required');
    }
    this.baseUrl = apiUrl.trim();
    this.token = token.trim();
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const errorMessage = `Grist API error: ${response.status} ${response.statusText}`;
      throw new GristApiError(response.status, response.statusText, errorMessage);
    }
    return response.json();
  }

  /**
   * Create a new document in a workspace
   */
  async createDocument(workspaceId: number, documentName: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/workspaces/${workspaceId}/docs`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name: documentName }),
      });

      const data = await this.handleResponse(response);
      return data.id || data; // Handle different response formats
    } catch (error) {
      console.error('Error creating Grist document:', error);
      throw error;
    }
  }

  /**
   * Add tables to a document
   */
  async addTablesToDocument(documentId: string, tables: GristTable[]): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/docs/${documentId}/tables`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ tables }),
      });

      const data = await this.handleResponse(response);
      return data.tables.map((table: any) => table.id);
    } catch (error) {
      console.error('Error adding tables to Grist document:', error);
      throw error;
    }
  }

  /**
   * Add records to a table
   */
  async addRecordsToTable(documentId: string, tableId: string, records: Record<string, any>[]): Promise<void> {
    try {
      const gristFormattedRecords = records.map(record => ({
        fields: record
      }));

      const response = await fetch(`${this.baseUrl}/api/docs/${documentId}/tables/${tableId}/records`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ records: gristFormattedRecords }),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error adding records to Grist table:', error);
      throw error;
    }
  }

  /**
   * Extract document ID from Grist URL
   */
  static extractDocumentId(url: string): string {
    const match = url.match(/\/doc\/([^\/\?]+)/);
    if (!match) {
      throw new Error('Invalid Grist document URL. Expected format: https://docs.getgrist.com/doc/DOC_ID');
    }
    return match[1];
  }
}

/**
 * Convert Airtable field type to Grist field type
 */
export function airtableToGristFieldType(airtableType: string): GristFieldType {
  const typeMapping: Record<string, GristFieldType> = {
    'singleLineText': GristFieldType.TEXT,
    'multilineText': GristFieldType.TEXT,
    'richText': GristFieldType.TEXT,
    'email': GristFieldType.TEXT,
    'url': GristFieldType.TEXT,
    'phoneNumber': GristFieldType.TEXT,
    'number': GristFieldType.NUMERIC,
    'currency': GristFieldType.NUMERIC,
    'percent': GristFieldType.NUMERIC,
    'date': GristFieldType.DATE,
    'dateTime': GristFieldType.DATETIME,
    'checkbox': GristFieldType.BOOL,
    'singleSelect': GristFieldType.CHOICE,
    'multipleSelects': GristFieldType.TEXT, // Grist doesn't have multi-choice, use text
    'formula': GristFieldType.TEXT, // Will need special handling
    'attachment': GristFieldType.TEXT, // Store as URLs/text
    'autoNumber': GristFieldType.INT,
    'barcode': GristFieldType.TEXT,
    'button': GristFieldType.TEXT,
    'collaborator': GristFieldType.TEXT,
    'count': GristFieldType.INT,
    'createdBy': GristFieldType.TEXT,
    'createdTime': GristFieldType.DATETIME,
    'duration': GristFieldType.NUMERIC,
    'lastModifiedBy': GristFieldType.TEXT,
    'lastModifiedTime': GristFieldType.DATETIME,
    'lookup': GristFieldType.TEXT,
    'rating': GristFieldType.INT,
    'rollup': GristFieldType.TEXT,
  };

  return typeMapping[airtableType] || GristFieldType.TEXT;
}

/**
 * Convert Airtable table schema to Grist table schema
 */
export function airtableToGristTable(airtableTable: any): GristTable {
  const columns: GristColumn[] = airtableTable.fields.map((field: any) => ({
    id: field.id,
    fields: {
      label: field.name,
      type: airtableToGristFieldType(field.type),
    },
  }));

  return {
    id: airtableTable.name,
    columns,
  };
}

/**
 * Create a Grist service instance
 */
export const createGristService = (apiUrl: string, token: string): GristService => {
  return new GristService(apiUrl, token);
}; 