import { Button, Pagination, Space, Spin, TableColumnsType, Typography } from "antd";
import { ContentWrapper, DataTable } from "@components/index";
import { useEffect, useState } from "react";

import { Icon } from "@iconify/react";
import { SortOrder } from "antd/lib/table/interface";
import { debounce } from "lodash";
import { get } from "@services/api.service";
import { getColoriezedValue } from "~/Utils/getColorizedValue";
import moment from "moment";
import { permissions } from "@utils/Roles";
import { useHasAccess } from "@hooks/useHasAccess";
import { useNavigate } from "react-router-dom";
import { useQuery } from "~/Hooks/useQuery";

export const CLM = () => {
  const [data, setData] = useState<any>([]);
  const { hasPermissions } = useHasAccess();
  const recordsPerPage = 10;
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setpage] = useState<number>();
  const [sortOrder, setSortOrder] = useState("desc");
  const [orderByName, setOrderByName] = useState("compeletedDate");
  const [pageStart, setPageStart] = useState<number>(0);
  const [searchString, setSearchString] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const query = useQuery();

  const getRecords = (sortOrder: string, orderByParam: string, searchString: any, currentPage?: number) => {
    setIsLoading(true);
    let status = query.get("status");
    let url = `v1/clm/list?page=${currentPage}&size=${recordsPerPage}&order=${sortOrder}&orderBy=${"contractName"}&searchText=${searchString}`;
    if (status) {
      url += `&status=${status}`;
    }
    get(url)
      .then((res: any) => {
        if (res?.response?.data) {
          setTotalRecords(res.response.data.total);
          let envelopes = res.response.data.records;
          setData(envelopes);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };
  const handleSearchChange = debounce((value: string, isLoading: boolean) => {
    setSearchString(value);
    setIsLoading(isLoading);
  }, 1000);
  const handleTableSort = (column: any, sortOrder: string, page: any) => {

    let order = "";
    if (column.sorter) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
        order = "desc";
      } else if (sortOrder === "desc") {
        setSortOrder("asc");
        order = "asc";
      }
    }
    setOrderByName(
      column.dataIndex === "compeletedDate"
        ? "compeletedDate"
        : column.dataIndex === "contractStartDate"
        ? "contractStartDate"
        : "contractName"
    );
    getRecords(order, column.dataIndex, searchString, pageStart);
  };

  useEffect(() => {
    setIsLoading(true);
    getRecords(sortOrder, orderByName, searchString, searchString.length > 0 ? 0 : pageStart);
  }, [searchString]);

  const columns: TableColumnsType = [
    {
      title: "Contract Name",
      dataIndex: "contractName",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      sorter: true,
      sortOrder:
        sortOrder === "asc" && orderByName === "contractName"
          ? "ascend"
          : sortOrder === "desc" && orderByName === "contractName"
          ? "descend"
          : undefined,
    },
    {
      title: "Envelope ID",
      dataIndex: "envelopeId",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
    },
    {
      title: "Sender Name",
      dataIndex: "senderName",
      render: (value: any, record: any) => value || <Typography.Text disabled>-</Typography.Text>,
    },
    {
      title: "Sender Email",
      dataIndex: "senderMail",
      render: (value: any, record: any) => value || <Typography.Text disabled>-</Typography.Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value: any) => getColoriezedValue(value),
      // sortOrder:
      //   ( sortOrder === "asc" && orderByName ===  "status" )
      //     ? "ascend"
      //     :( sortOrder === "desc" && orderByName === "status")
      //       ? "descend"
      //       : undefined,
    },
    {
      title: "Start Date",
      dataIndex: "contractStartDate",
      sorter: false,
      render: (value: any) =>
        value ? (
          <Typography.Text>{moment(value, "YYYY-MM-DD").format("DD MMM YYYY")}</Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      sortOrder:
        sortOrder === "asc" && orderByName === "contractStartDate"
          ? "ascend"
          : sortOrder === "desc" && orderByName === "contractStartDate"
          ? "descend"
          : undefined,
    },

    {
      title: "Completed Date",
      dataIndex: "compeletedDate",
      render: (value: any) =>
        value && value !== "" && value !== "null" ? (
          <Typography.Text>{moment(value, "YYYY-MM-DD").format("DD MMM YYYY")}</Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      sorter: false,
      defaultSortOrder: "ascend" as SortOrder,
      sortDirections: ["ascend", "descend"],
      sortOrder:
        sortOrder === "asc" && (orderByName === "" || orderByName !== "contractName" || "contractStartDate")
          ? "ascend"
          : sortOrder === "desc" && orderByName !== "contractName" || "contractStartDate"
          ? "descend"
          : undefined,
    },
  ];

  return (
    <ContentWrapper
      title={"Contract Lifecycle Management"}
      actionItems={
        //2061
        hasPermissions([permissions.ADD_CONTRACT]) && (
          <Button
            type="primary"
            onClick={() => navigate("/clm/contracts/add")}
          >
            <Space>
              <Icon
                icon="akar-icons:plus"
                inline
              />
              Add
            </Space>
          </Button>
        )
      }
    >
      {isLoading && (
        <div className="loadingOverlay">
          <Space size="middle">
            <Spin size="large" />
          </Space>
        </div>
      )}
      <DataTable
        columns={columns?.map((column) => ({
          ...column,
          onHeaderCell: (column: any) => ({
            onClick: () => handleTableSort(column, sortOrder, page ? page : 0),
          }),
        }))}
        className="table-clickable"
        tableData={data.map(({ ...d }: any) => {
          if (d.compeletedDate) {
            d.compeletedDate = d.compeletedDate.replace("null", "");
          }
          return {
            ...d,
            key: d.contractId,
            contractStartDate: moment(d.contractStartDate).format("YYYY-MM-DD"),
            compeletedDate: d.compeletedDate ? moment(d.compeletedDate).format("YYYY-MM-DD") : null,
          };
        })}
        isLoading={false}
        exportFileName="Contracts"
        onSearchChange={handleSearchChange}
        onClick={(record) => navigate(`/clm/contracts/view/${record.envelopeId}`)}
        isPagination={true}
        isServerSearchApi={true}
        inputDisable={isLoading}
      />
      <div className="pagination">
        <Pagination
          defaultCurrent={1}
          total={data && totalRecords}
          onChange={(page) => {
            const pageSize = 10;
            const startIndex = page-1
            setpage(page - 1);
            setPageStart(startIndex);
            getRecords(sortOrder, orderByName, searchString, startIndex);
          }}
          showSizeChanger={false}
        />
      </div>
    </ContentWrapper>
  );
};
