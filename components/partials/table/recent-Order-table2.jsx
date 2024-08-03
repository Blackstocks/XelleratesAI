import React, { useState, useMemo } from "react";
import { recentOrder } from "@/constant/table-data";
import Icon from "@/components/ui/Icon";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";

const COLUMNS = [
  {
    Header: "user",
    accessor: "user",
    Cell: (row) => {
      return (
        <div>
          <div className="flex items-center">
            <div className="flex-none">
              <div className="w-8 h-8 rounded-[100%] ltr:mr-2 rtl:ml-2">
                <img
                  src={row?.cell?.value.image}
                  alt=""
                  className="w-full h-full rounded-[100%] object-cover"
                />
              </div>
            </div>
            <div className="flex-1 text-start">
              <h4 className="text-sm font-medium text-slate-600">
                {row?.cell?.value.name}
              </h4>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    Header: "invoice",
    accessor: "invoice",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "price",
    accessor: "price",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "status",
    accessor: "status",
    Cell: (row) => {
      return (
        <span className="block w-full">
          <span
            className={` inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${
              row?.cell?.value === "paid"
                ? "text-success-500 bg-success-500"
                : ""
            } 
            ${
              row?.cell?.value === "due"
                ? "text-warning-500 bg-warning-500"
                : ""
            }
            ${
              row?.cell?.value === "canceled"
                ? "text-danger-500 bg-danger-500"
                : ""
            }
                ${
                  row?.cell?.value === "pending"
                    ? "text-danger-500 bg-danger-500"
                    : ""
                } ${
              row?.cell?.value === "shipped"
                ? "text-primary-500 bg-primary-500"
                : ""
            }
            
             `}
          >
            {row?.cell?.value}
          </span>
        </span>
      );
    },
  },
];

const RecentOrderTable2 = () => {
  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => recentOrder.slice(0, 4), []); // Limit to 4 rows

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 4, // Show only 4 rows
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );

  const {
    getTableProps,
    getTableBodyProps,
    page,
    prepareRow,
  } = tableInstance;

  return (
    <>
      <div>
        <div className="overflow-x-auto -mx-6">
        <h6 className="ml-6 mb-4">Top Conversations</h6>
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                {...getTableProps()}
              >
                <tbody
                  className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700"
                  {...getTableBodyProps()}
                >
                  {page.map((row) => {
                    prepareRow(row);
                    const { key, ...restRowProps } = row.getRowProps();
                    return (
                      <tr key={key} {...restRowProps}>
                        {row.cells.map((cell) => {
                          const { key, ...restCellProps } = cell.getCellProps();
                          return (
                            <td
                              key={key}
                              {...restCellProps}
                              className="table-td"
                            >
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecentOrderTable2;
