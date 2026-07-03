import { DatePipe } from '@angular/common';
import { ElementRef, Injectable } from '@angular/core';
import { Nullable } from 'primeng/ts-helpers';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor(private datePipe: DatePipe) {}

  public async excel(fileName: string, element: Nullable<ElementRef>): Promise<void> {
    const table = element?.nativeElement as HTMLTableElement | undefined;
    const rows = Array.from(table?.rows ?? []).map((row) =>
      Array.from(row.cells)
        .map((cell) => `"${cell.textContent?.trim().replace(/"/g, '""') ?? ''}"`)
        .join(',')
    );

    this.saveAsExcelFile(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }), fileName);
  }

  public excel_blob(fileName: string, response: Blob): void {
    this.saveAsExcelFile(response, fileName);
  }

  public exportSelectColsWithDynamicHeader(
    data: any[],
    columns: { key: string; value: string }[],
    fileName: string
  ): void {
    const rows = [
      columns.map((column) => column.value),
      ...data.map((item, index) => columns.map((column) => column.key === 'no' ? index + 1 : item[column.key] ?? ''))
    ];
    const worksheet = rows.map((row) => row.join(',')).join('\n');
    this.saveAsExcelFile(new Blob([worksheet], { type: 'text/csv;charset=utf-8' }), fileName);
  }

  private saveAsExcelFile(buffer: BlobPart, fileName: string): void {
    const blob = buffer instanceof Blob
      ? buffer
      : new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `${fileName} ${this.datePipe.transform(new Date(), 'dd-MMM-yy')}.xlsx`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }
}
