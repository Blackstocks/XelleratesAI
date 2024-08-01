import React, { useMemo } from "react";
import { useTable, useSortBy, useExpanded } from "react-table";

// Data with nested rows for the example
const data = [
  {
    name: "Founder",
    shareHolding: "53.5%",
    totalShares: "76,740,000",
    subRows: [
      {
        name: "Sameer Mehta",
        shareHolding: "26.8%",
        totalShares: "38,370,000",
      },
      {
        name: "Aman Gupta",
        shareHolding: "26.8%",
        totalShares: "38,370,000",
      },
    ],
  },
  {
    name: "Fund",
    shareHolding: "45.5%",
    totalShares: "65,269,291",
    subRows: [
      {
        name: "Warburg Pincus",
        shareHolding: "38.3%",
        totalShares: "54,850,232",
      },
      {
        name: "Fireside Ventures",
        shareHolding: "3.6%",
        totalShares: "5,100,000",
      },
      {
        name: "Qualcomm Ventures",
        shareHolding: "2.5%",
        totalShares: "3,524,000",
      },
      {
        name: "Malabar Investments",
        shareHolding: "0.9%",
        totalShares: "1,331,559",
      },
      {
        name: "Innowen Capital",
        shareHolding: "0.3%",
        totalShares: "463,500",
      },
    ],
  },
  {
    name: "Enterprise",
    shareHolding: "-",
    totalShares: "-",
    subRows: [
      { name: "Neo Markets Services", shareHolding: "-", totalShares: "6,370" },
      { name: "Amplify Capitals", shareHolding: "-", totalShares: "5,020" },
      { name: "Altius Investech", shareHolding: "-", totalShares: "1,200" },
      { name: "3ADeal", shareHolding: "-", totalShares: "50" },
    ],
  },
  {
    name: "Other People",
    shareHolding: "0.2%",
    totalShares: "363,000",
  },
  {
    name: "ESOP",
    shareHolding: "0.7%",
    totalShares: "1,005,200",
  },
  {
    name: "Other Investors",
    shareHolding: "< 0.1%",
    totalShares: "13,430",
  },
  {
    name: "Total",
    shareHolding: "100.0%",
    totalShares: "143,397,291",
  },
];

// Columns definition
const COLUMNS = [
  {
    Header: "Name",
    accessor: "name",
    Cell: ({ row, value }) => (
      <div className="flex items-center">
        {row.canExpand ? (
          <span
            {...row.getToggleRowExpandedProps()}
            className="mr-2 cursor-pointer"
          >
            {row.isExpanded ? "▼" : "▶"}
          </span>
        ) : null}
        {value}
      </div>
    ),
  },
  {
    Header: "% Share holding",
    accessor: "shareHolding",
  },
  {
    Header: "Total Outstanding Shares",
    accessor: "totalShares",
  },
];

const RecentOrderTable = () => {
  const columns = useMemo(() => COLUMNS, []);
  const dataMemo = useMemo(() => data, []);

  const tableInstance = useTable(
    {
      columns,
      data: dataMemo,
    },
    useSortBy,
    useExpanded // Use the useExpanded plugin hook
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div className="overflow-x-auto">
      <table {...getTableProps()} className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " ▼"
                        : " ▲"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
          {rows.map((row) => {
            prepareRow(row);
            return (
              <React.Fragment key={row.id}>
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
                {row.isExpanded && row.subRows && row.subRows.length > 0 ? (
                  row.subRows.map((subRow, i) => {
                    prepareRow(subRow);
                    return (
                      <tr key={subRow.id} {...subRow.getRowProps()}>
                        {subRow.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-10"
                          >
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ) : null}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrderTable;
