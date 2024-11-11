import { Pagination, Select, TableColumnsType, Tag, Typography } from "antd";
import { ContentWrapper, DataTable } from "~/Components";
import { useEffect, useState } from "react";
import { columnWidth } from "@components/DataTable/Properties";
import moment from "moment/moment";
import { useNotification } from "@hooks/useNotification";
import { get } from "~/Services";

export const AuditLogs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState<any>([]);
  const [selectedAction, setselectedAction] = useState<any>([]);
  const { openToast } = useNotification();
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 100;

  const columns: TableColumnsType = [
    {
      title: "Time Stamp",
      dataIndex: "createdOn",
      fixed: true,
      render: (value: any) =>
        value ? (
          <Typography.Text>{moment(value).format("DD MMM YYYY HH:mm:ss A")}</Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      width: columnWidth.DATE,
      ellipsis: true,
      sorter: (a: any, b: any) => Number(new Date(a.createdOn)) - Number(new Date(b.createdOn)),
    },
    {
      title: "Category",
      dataIndex: "actionCategory",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.APPLICATION_CATEGORY,
      sorter: (a: any, b: any) => (a.actionCategory || "").localeCompare(b.actionCategory || ""),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.USER_NAME,
      sorter: (a: any, b: any) => (a.action || "").localeCompare(b.action || ""),
    },
    {
      title: "Summary",
      dataIndex: "actionSummary",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.GENERAL,
      sorter: (a: any, b: any) => (a.actionSummary || "").localeCompare(b.actionSummary || ""),
    },
    {
      title: "User",
      dataIndex: "userEmail",
      render: (_, value: any) =>
        (
          <span>
            {value.userEmail}
            <br></br>
            {value.role}
          </span>
        ) || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.EMAIL,
      sorter: (a: any, b: any) => (a.userEmail || "").localeCompare(b.userEmail || ""),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value: any, record: any) => {
        const { status, statusCode } = record;
        let color, backgroundColor;

        if (statusCode === 200) {
          color = "#00C247";
          backgroundColor = "#00C2471A";
        } else {
          color = "#FF3333";
          backgroundColor = "#FF33331A";
        }

        return value ? (
          <Tag style={{ color, backgroundColor }}>{status}</Tag>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        );
      },
      ellipsis: true,
      width: columnWidth.GENERAL,
      sorter: (a: any, b: any) => (a.status || "").localeCompare(b.status || ""),
    },
  ];

  const getRecords = (page = currentPage, size = recordsPerPage) => {
    setIsLoading(true);
    get(`/v1/user/auditlogs/actions?page=${page - 1}&size=${size}`)
      .then((res: any) => {
        if (res.status === "OK") {
          if (res && res?.response && res.response?.data && res.response?.data?.records) {
            let audit = res?.response?.data?.records;
            setTotalRecords(res?.response?.data?.total);
            setData(audit);
            setFilteredData(audit);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        openToast({
          content: "Getting Templates failed",
          type: "error",
        });
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getRecords(currentPage);
    setIsLoading(true);
  }, [currentPage]);

  const categoryName = (value: any) => {
    const name = new Set();
    const uniqecategories = value.filter((item: any) => {
      if (item.actionCategory === null || item.actionCategory === "" || name.has(item.actionCategory)) {
        return false;
      }
      return name.add(item.actionCategory);
    });
    return [{ actionCategory: "All" }, ...uniqecategories];
  };
  const uniqueCategory = categoryName(data);

  const status = (value: any) => {
    const name = new Set();
    const uniqueStatusOptions = value.filter((item: any) => {
      if (item.status === null || item.status === "" || name.has(item.status)) {
        return false;
      }
      return name.add(item.status);
    });
    return [{ status: "All" }, ...uniqueStatusOptions];
  };
  const uniqueStatus = status(data);

  const action = (value: any) => {
    const name = new Set();
    return value.filter((item: any) => {
      if (item.action === null || item.action === "" || name.has(item.action)) {
        return false;
      }
      return name.add(item.action);
    });
  };
  const uniqueAction = action(data);
  const applyFilters = () => {
    let filtered = data;
    if (selectedCategory != "" && selectedCategory !== "All") {
      filtered = filtered.filter((d: any) => d.actionCategory === selectedCategory);
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
    if (selectedStatus != "" && selectedStatus !== "All") {
      filtered = filtered.filter((d: any) => d.status === selectedStatus);
      setFilteredData(filtered);
    }

    if (selectedAction != "" && selectedAction !== "All") {
      filtered = filtered.filter((d: any) => d.action === selectedAction);
      setFilteredData(filtered);
    }
  };

  const handleChangeCategory = (value: any) => {
    setSelectedCategory(value || "All");
  };

  const handleChangeStatus = (value: any) => {
    setSelectedStatus(value || "All");
  };

  const handleChangeAction = (value: any) => {
    setselectedAction(value || "All");
  };

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedStatus, selectedAction, applyFilters]);

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
    setFilteredData([]);
    setSelectedCategory([]);
    setSelectedStatus([]);
    setselectedAction([]);
  };

  return (
    <ContentWrapper
      loading={isLoading}
      title={"Audit Logs"}
    >
      <DataTable
        columns={columns}
        isLoading={isLoading}
        className="table-clickable"
        additionalCTA={
          <>
            <Select
              style={{ width: 150, marginRight: "10px" }}
              showSearch
              placeholder="Category"
              onChange={(e) => handleChangeCategory(e)}
            >
              {uniqueCategory &&
                uniqueCategory.map((category: any, index: any) => (
                  <Select.Option
                    key={index}
                    value={category.actionCategory}
                  >
                    {category.actionCategory}
                  </Select.Option>
                ))}
            </Select>
            <Select
              style={{ width: 150, marginRight: "10px" }}
              showSearch
              placeholder="Status"
              onChange={(e) => handleChangeStatus(e)}
            >
              {uniqueStatus &&
                uniqueStatus.map((item: any, index: any) => (
                  <Select.Option
                    key={index}
                    value={item.status}
                  >
                    {item.status}
                  </Select.Option>
                ))}
            </Select>
            <Select
              style={{ width: 150, marginRight: "10px" }}
              showSearch
              placeholder="Actions"
              onChange={handleChangeAction}
            >
              <Select.Option value="All">All</Select.Option>
              {uniqueAction &&
                uniqueAction.map((item: any, index: any) => (
                  <Select.Option
                    key={index}
                    value={item.action}
                  >
                    {item.action}
                  </Select.Option>
                ))}
            </Select>
          </>
        }
        tableData={filteredData.map((d: any, index: number) => {
          return {
            ...d,
            key: index,
            created: moment(d.created).format("YYYY-MM-DD"),
            lastModified: moment(d.lastModified).format("YYYY-MM-DD"),
          };
        })}
        // {...{
        //   tableActions: tableActions,
        // }}
        isPagination={true}
        isServerSearchApi={true}
        exportFileName="AuditLogs"
      />
      <div className="pagination">
        <Pagination
          defaultCurrent={1}
          pageSize={100}
          current={currentPage}
          total={totalRecords}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>
    </ContentWrapper>
  );
};