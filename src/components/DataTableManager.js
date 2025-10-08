/**
 * DataTableManager - Manage sortable data tables with export functionality
 *
 * Features:
 * - Cable data table with sorting
 * - Data center table with tier filtering
 * - CSV export for both datasets
 * - Modal dialog management
 * - Filter integration
 */

export class DataTableManager {
  /**
   * @param {Function} getFilteredData - Callback to get filtered data
   * @param {Function} calculateDistance - Distance calculation utility
   */
  constructor(getFilteredData, calculateDistance) {
    this.getFilteredData = getFilteredData;
    this.calculateDistance = calculateDistance;
    this.sortState = {
      column: null,
      ascending: true
    };
  }

  /**
   * Initialize table controls
   */
  init() {
    this.setupCableTable();
    this.setupDataCenterTable();
  }

  /**
   * Setup cable table functionality
   */
  setupCableTable() {
    const toggleButton = document.getElementById('cable-table-toggle');
    const modal = document.getElementById('list-view-modal');
    const closeButton = document.getElementById('list-view-close');
    const exportButton = document.getElementById('export-csv');

    toggleButton?.addEventListener('click', () => {
      if (modal) {
        modal.classList.remove('hidden');
        this.populateCableTable();
      }
    });

    closeButton?.addEventListener('click', () => {
      modal?.classList.add('hidden');
    });

    // Close on background click
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });

    exportButton?.addEventListener('click', () => {
      this.exportCablesToCSV();
    });

    // Setup sortable headers
    this.setupTableSorting('cable-table');
  }

  /**
   * Setup data center table functionality
   */
  setupDataCenterTable() {
    const toggleButton = document.getElementById('datacenter-table-toggle');
    const modal = document.getElementById('datacenter-list-modal');
    const closeButton = document.getElementById('datacenter-list-close');
    const exportButton = document.getElementById('datacenter-export-csv');

    toggleButton?.addEventListener('click', () => {
      if (modal) {
        modal.classList.remove('hidden');
        this.populateDataCenterTable();
      }
    });

    closeButton?.addEventListener('click', () => {
      modal?.classList.add('hidden');
    });

    exportButton?.addEventListener('click', () => {
      this.exportDataCentersToCSV();
    });
  }

  /**
   * Populate cable table with filtered data
   */
  populateCableTable() {
    const cables = this.getFilteredData('cables');
    const tbody = document.getElementById('cable-tbody');
    const filteredCount = document.getElementById('filtered-count');
    const totalCount = document.getElementById('total-count');

    if (!tbody) return;

    // Update counts
    if (filteredCount) filteredCount.textContent = cables.length;
    if (totalCount) totalCount.textContent = this.getFilteredData('cablesTotal');

    // Clear existing rows
    tbody.innerHTML = '';

    // Create rows
    cables.forEach(cable => {
      const distance = this.calculateDistance(
        cable.landing_point_1.latitude,
        cable.landing_point_1.longitude,
        cable.landing_point_2.latitude,
        cable.landing_point_2.longitude
      );

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${this.escapeHtml(cable.name || 'Unknown Cable')}</td>
        <td>${cable.capacity_tbps ? cable.capacity_tbps.toFixed(1) : 'N/A'}</td>
        <td>${Math.round(distance)}</td>
        <td>${this.escapeHtml(cable.landing_point_1.location || `${cable.landing_point_1.latitude.toFixed(1)}°, ${cable.landing_point_1.longitude.toFixed(1)}°`)}</td>
        <td>${this.escapeHtml(cable.landing_point_2.location || `${cable.landing_point_2.latitude.toFixed(1)}°, ${cable.landing_point_2.longitude.toFixed(1)}°`)}</td>
        <td class="status-${cable.status || 'active'}">${(cable.status || 'Active').toUpperCase()}</td>
        <td class="accuracy-${cable.data_accuracy === 'live' ? 'live' : 'estimated'}">${cable.data_accuracy === 'live' ? 'Live' : 'Estimated'}</td>
      `;
      tbody.appendChild(row);
    });
  }

  /**
   * Populate data center table
   */
  populateDataCenterTable() {
    const datacenters = this.getFilteredData('datacenters');
    const tbody = document.getElementById('datacenter-tbody');
    const filteredCount = document.getElementById('datacenter-filtered-count');
    const totalCount = document.getElementById('datacenter-total-count');

    if (!tbody) return;

    // Update counts
    if (filteredCount) filteredCount.textContent = datacenters.length;
    if (totalCount) totalCount.textContent = this.getFilteredData('datacentersTotal');

    // Clear existing rows
    tbody.innerHTML = '';

    // Create rows
    datacenters.forEach(dc => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${this.escapeHtml(dc.city || 'Unknown')}</td>
        <td>${this.escapeHtml(dc.country || 'Unknown')}</td>
        <td><span class="tier-badge tier${dc.tier}">Tier ${dc.tier}</span></td>
        <td>${this.escapeHtml(dc.provider || 'N/A')}</td>
        <td>${dc.latitude?.toFixed(4)}, ${dc.longitude?.toFixed(4)}</td>
        <td>${this.escapeHtml(dc.name || 'DC')}</td>
        <td><span class="status-active">Active</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  /**
   * Setup table sorting functionality
   * @param {string} tableId
   */
  setupTableSorting(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const headers = table.querySelectorAll('th.sortable');
    headers.forEach((header, index) => {
      header.addEventListener('click', () => {
        this.sortTable(tableId, index, header.dataset.type || 'text');
      });
    });
  }

  /**
   * Sort table by column
   * @param {string} tableId
   * @param {number} columnIndex
   * @param {string} dataType - 'text' or 'number'
   */
  sortTable(tableId, columnIndex, dataType) {
    const table = document.getElementById(tableId);
    const tbody = table?.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const ascending = this.sortState.column === columnIndex ? !this.sortState.ascending : true;

    rows.sort((a, b) => {
      const aValue = a.children[columnIndex]?.textContent.trim() || '';
      const bValue = b.children[columnIndex]?.textContent.trim() || '';

      let comparison = 0;
      if (dataType === 'number') {
        const aNum = parseFloat(aValue.replace(/[^\d.-]/g, '')) || 0;
        const bNum = parseFloat(bValue.replace(/[^\d.-]/g, '')) || 0;
        comparison = aNum - bNum;
      } else {
        comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
      }

      return ascending ? comparison : -comparison;
    });

    // Clear and repopulate tbody
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));

    // Update sort state
    this.sortState.column = columnIndex;
    this.sortState.ascending = ascending;

    // Update header indicators
    table.querySelectorAll('th').forEach((th, i) => {
      th.classList.remove('sort-asc', 'sort-desc');
      if (i === columnIndex) {
        th.classList.add(ascending ? 'sort-asc' : 'sort-desc');
      }
    });
  }

  /**
   * Export cables to CSV
   */
  exportCablesToCSV() {
    const cables = this.getFilteredData('cables');
    const headers = ['Name', 'Capacity (Tbps)', 'Distance (km)', 'From', 'To', 'Status', 'Data Accuracy'];

    const rows = cables.map(cable => {
      const distance = this.calculateDistance(
        cable.landing_point_1.latitude,
        cable.landing_point_1.longitude,
        cable.landing_point_2.latitude,
        cable.landing_point_2.longitude
      );

      return [
        cable.name || 'Unknown',
        cable.capacity_tbps || 'N/A',
        Math.round(distance),
        cable.landing_point_1.location || `${cable.landing_point_1.latitude.toFixed(1)}°, ${cable.landing_point_1.longitude.toFixed(1)}°`,
        cable.landing_point_2.location || `${cable.landing_point_2.latitude.toFixed(1)}°, ${cable.landing_point_2.longitude.toFixed(1)}°`,
        cable.status || 'Active',
        cable.data_accuracy === 'live' ? 'Live' : 'Estimated'
      ];
    });

    const csv = this.generateCSV(headers, rows);
    this.downloadCSV(csv, 'submarine_cables.csv');
  }

  /**
   * Export data centers to CSV
   */
  exportDataCentersToCSV() {
    const datacenters = this.getFilteredData('datacenters');
    const headers = ['City', 'Country', 'Tier', 'Provider', 'Latitude', 'Longitude', 'Name'];

    const rows = datacenters.map(dc => [
      dc.city || 'Unknown',
      dc.country || 'Unknown',
      `Tier ${dc.tier}`,
      dc.provider || 'N/A',
      dc.latitude,
      dc.longitude,
      dc.name || 'DC'
    ]);

    const csv = this.generateCSV(headers, rows);
    this.downloadCSV(csv, 'data_centers.csv');
  }

  /**
   * Generate CSV string from headers and rows
   * @param {Array} headers
   * @param {Array} rows
   * @returns {string}
   */
  generateCSV(headers, rows) {
    const escapedHeaders = headers.map(h => `"${h}"`).join(',');
    const escapedRows = rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    );

    return [escapedHeaders, ...escapedRows].join('\n');
  }

  /**
   * Download CSV file
   * @param {string} csv
   * @param {string} filename
   */
  downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
