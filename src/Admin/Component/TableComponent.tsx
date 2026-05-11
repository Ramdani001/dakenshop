"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Pagination,
  Row,
  Col,
  Spinner,
  Card,
  InputGroup,
  Button,
} from "react-bootstrap";
import {
  Search,
  X,
  SortAlphaDown,
  SortAlphaUp,
  ArrowDownUp,
} from "react-bootstrap-icons";

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: "start" | "center" | "end";
}

interface MetaData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  metadata: MetaData;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  loading?: boolean;
  filterValues?: Record<string, string>;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (key: string, order: "asc" | "desc") => void;
  onFilterChange?: (key: string, value: string) => void;
  height?: number | string;
}

const ColumnFilter = ({
  initialValue,
  onChange,
}: {
  initialValue: string;
  onChange: (val: string) => void;
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [value, onChange, initialValue]);

  return (
    <InputGroup size="sm" className="mt-2">
      <InputGroup.Text className="bg-light border-end-0 py-0 px-2">
        <Search size={10} />
      </InputGroup.Text>
      <Form.Control
        placeholder="Cari..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="bg-light border-start-0 ps-1"
        style={{ fontSize: "11px", height: "28px", boxShadow: "none" }}
      />
      {value && (
        <Button
          variant="outline-secondary"
          className="bg-light border-start-0 border-secondary-subtle py-0 px-2"
          onClick={() => {
            setValue("");
            onChange("");
          }}
        >
          <X size={14} />
        </Button>
      )}
    </InputGroup>
  );
};

export function TableComponent<
  T extends { id?: number | string; [key: string]: any },
>({
  data,
  columns,
  metadata,
  sortBy,
  sortOrder,
  loading = false,
  filterValues = {},
  onPageChange,
  onLimitChange,
  onSortChange,
  onFilterChange,
  height = "60vh",
}: TableProps<T>) {
  const handleSortClick = (key: string) => {
    const newOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    onSortChange(key, newOrder);
  };

  return (
    <Card
      className="border shadow-sm overflow-hidden"
      style={{ borderRadius: "12px" }}
    >
      <Card.Body className="p-0">
        <div style={{ height: height, overflow: "auto" }}>
          <Table responsive hover striped className="mb-0">
            <thead
              className="bg-white border-bottom sticky-top"
              style={{ zIndex: 5 }}
            >
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width, minWidth: "120px" }}
                    className="py-3 px-3 align-top bg-white"
                  >
                    <div className="d-flex flex-column">
                      <div
                        className={`d-flex align-items-center justify-content-between ${col.sortable ? "user-select-none" : ""}`}
                        onClick={() => col.sortable && handleSortClick(col.key)}
                        style={{ cursor: col.sortable ? "pointer" : "default" }}
                      >
                        <span
                          className="small fw-bold text-uppercase text-muted"
                          style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                        >
                          {col.label}
                        </span>
                        {col.sortable && (
                          <span className="ms-2">
                            {sortBy === col.key ? (
                              sortOrder === "asc" ? (
                                <SortAlphaDown
                                  className="text-primary"
                                  size={14}
                                />
                              ) : (
                                <SortAlphaUp
                                  className="text-primary"
                                  size={14}
                                />
                              )
                            ) : (
                              <ArrowDownUp
                                className="text-muted opacity-50"
                                size={12}
                              />
                            )}
                          </span>
                        )}
                      </div>

                      {col.filterable && onFilterChange && (
                        <ColumnFilter
                          initialValue={filterValues[col.key] || ""}
                          onChange={(val) => onFilterChange(col.key, val)}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-5">
                    <Spinner
                      animation="border"
                      variant="primary"
                      size="sm"
                      className="mb-2"
                    />
                    <div className="small text-muted">Retrieving data...</div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item.id || index}>
                    {columns.map((col) => (
                      <td key={col.key} className="small py-3 px-3">
                        {col.render
                          ? col.render(item, index)
                          : (item[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-5 text-muted small"
                  >
                    Data not found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>

      <Card.Footer className="bg-white border-top py-3">
        <Row className="align-items-center">
          <Col sm={12} md={6} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">Limit:</span>
                <Form.Select
                  size="sm"
                  style={{ width: "75px", fontSize: "12px" }}
                  value={metadata.limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                >
                  {[5, 10, 20, 50].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div
                className="small text-muted border-start ps-3"
                style={{ fontSize: "12px" }}
              >
                Show {(metadata.page - 1) * metadata.limit + 1} -
                {Math.min(metadata.page * metadata.limit, metadata.total)} from
                {metadata.total} entries
              </div>
            </div>
          </Col>
          <Col sm={12} md={6} className="d-flex justify-content-md-end">
            <Pagination size="sm" className="mb-0 flex-wrap">
              <Pagination.First
                disabled={metadata.page === 1}
                onClick={() => onPageChange(1)}
              />
              <Pagination.Prev
                disabled={metadata.page === 1}
                onClick={() => onPageChange(metadata.page - 1)}
              />

              <Pagination.Item active>{metadata.page}</Pagination.Item>

              <Pagination.Next
                disabled={metadata.page >= metadata.totalPages}
                onClick={() => onPageChange(metadata.page + 1)}
              />
              <Pagination.Last
                disabled={metadata.page >= metadata.totalPages}
                onClick={() => onPageChange(metadata.totalPages)}
              />
            </Pagination>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}
