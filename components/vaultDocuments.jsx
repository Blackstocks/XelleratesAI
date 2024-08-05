import React, { useMemo } from 'react';
import { useTable, useSortBy, useExpanded } from 'react-table';

const createSubRowData = (label, link) => {
  return link ? { name: label, details: link } : null;
};

const documentLabels = {
  balance_sheet: 'Balance Sheet',
  business_valuation_report: 'Business Valuation Report',
  cashflow_statement: 'Cashflow Statement',
  certificate_of_incorporation: 'Certificate of Incorporation',
  due_diligence_report: 'Due Diligence Report',
  employment_agreement: 'Employment Agreement',
  financial_projections: 'Financial Projections',
  gst_certificate: 'GST Certificate',
  mis: 'MIS',
  mou: 'Memorandum of Understanding (MOU)',
  nda: 'Non-Disclosure Agreement (NDA)',
  patent: 'Patent',
  pitch_deck: 'Pitch Deck',
  pl_statement: 'Profit & Loss Statement',
  sha: 'Shareholders Agreement (SHA)',
  startup_india_certificate: 'Startup India Certificate',
  termsheet: 'Termsheet',
  trademark: 'Trademark',
  video_pitch: 'Video Pitch',
  // Add more mappings as needed
};

const COLUMNS = [
  {
    Header: 'Name',
    accessor: 'name',
    Cell: ({ row, value }) => (
      <div className='flex items-center'>
        {row.canExpand ? (
          <span
            {...row.getToggleRowExpandedProps()}
            className='mr-2 cursor-pointer'
          >
            {row.isExpanded ? '▼' : '▶'}
          </span>
        ) : null}
        {value}
      </div>
    ),
  },
  {
    Header: 'Details',
    accessor: 'details',
    Cell: ({ value }) => {
      return value ? (
        <a
          href={value}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-500'
        >
          View
        </a>
      ) : (
        ''
      );
    },
  },
];

const RecentOrderTable = ({
  founderInformation,
  ctoInfo,
  companyDocuments,
}) => {
  const data = useMemo(() => {
    return [
      {
        name: 'Founder Information',
        details: null,
        subRows: [
          createSubRowData(
            'Co-founder Agreement',
            founderInformation?.co_founder_agreement
          ),
        ].filter(Boolean),
      },
      {
        name: 'CTO Information',
        details: null,
        subRows: [
          createSubRowData('Technology Roadmap', ctoInfo?.technology_roadmap),
        ].filter(Boolean),
      },
      {
        name: 'Company Documents',
        details: null,
        subRows: companyDocuments
          ? Object.entries(companyDocuments)
              .filter(
                ([key]) =>
                  key !== 'id' && key !== 'company_id' && key !== 'created_at'
              ) // Exclude id and company_id
              .map(([key, value]) =>
                createSubRowData(documentLabels[key] || key, value)
              )
              .filter(Boolean)
          : [],
      },
    ];
  }, [founderInformation, ctoInfo, companyDocuments]);

  const columns = useMemo(() => COLUMNS, []);

  const tableInstance = useTable(
    { columns, data, initialState: { expanded: {} } },
    useSortBy,
    useExpanded
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className='overflow-x-auto'>
      <table
        {...getTableProps()}
        className='min-w-full bg-white divide-y divide-gray-200'
      >
        <thead className='bg-gray-50'>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' ▼' : ' ▲') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          {...getTableBodyProps()}
          className='bg-white divide-y divide-gray-200'
        >
          {rows.map((row) => {
            prepareRow(row);
            const rowProps = row.getRowProps();
            const { key, ...restRowProps } = rowProps;

            return (
              <React.Fragment key={key}>
                <tr {...restRowProps}>
                  {row.cells.map((cell) => {
                    const cellProps = cell.getCellProps();
                    const { key: cellKey, ...restCellProps } = cellProps;

                    return (
                      <td
                        key={cellKey}
                        {...restCellProps}
                        className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
                {/* Uncomment this section to display sub-rows */}
                {/* {row.isExpanded &&
                  row.subRows.map((subRow, index) => {
                    prepareRow(subRow);
                    const subRowProps = subRow.getRowProps();
                    const { key: subRowKey, ...restSubRowProps } = subRowProps;

                    return (
                      <tr key={subRowKey} {...restSubRowProps}>
                        <td
                          colSpan={2}
                          className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-10'
                        >
                          {subRow.cells[0].render('Cell')}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {subRow.cells[1] && subRow.cells[1].render('Cell')}
                        </td>
                      </tr>
                    );
                  })} */}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrderTable;
