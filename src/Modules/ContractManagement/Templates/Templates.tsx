import { Button, Pagination, Space, Spin, TableColumnsType, Typography } from "antd";
import { ContentWrapper, DataTable } from "@components/index";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Icon } from "@iconify/react";
import { SortOrder } from "antd/lib/table/interface";
import { debounce } from "lodash";
import { get } from "@services/api.service";
import moment from "moment";
import { permissions } from "@utils/Roles";
import styles from "../Contract.module.scss";
import { useHasAccess } from "@hooks/useHasAccess";
import { useNotification } from "@hooks/useNotification";
import { useQuery } from "~/Hooks/useQuery";

export const Templates = () => {
  const [data, setData] = useState<any>([]);
  const { hasPermissions, hasRole } = useHasAccess();
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const recordsPerPage = 10;
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setpage] = useState<number>();
  const [orderByName, setOrderByName] = useState("modified");
  const [pageStart, setPageStart] = useState<number>(0);
  const navigate = useNavigate();
  const [searchString, setSearchString] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useQuery();

  const menuClick = (key: string, record: { [key in string]: any }) => {
    if (key === "delete") {
    }
    if (key === "edit") {
      navigate(`/clm/templates/edit/${record.templateId}`);
    }
  };

  const tableActions = {
    callback: menuClick,
    items: [
      {
        label: (
          <Typography.Text
            type="secondary"
            style={{ color: styles.primary }}
          >
            <Space>
              <Icon
                icon="akar-icons:edit"
                inline
                fontSize={16}
                style={{ color: styles.primary }}
              />
              Edit
            </Space>
          </Typography.Text>
        ),
        key: "edit",
      },
      // {
      //   label: (
      //     <Typography.Text type="danger">
      //       <Space>
      //         <Icon icon="fluent:delete-48-regular" inline fontSize={16} />
      //         Delete
      //       </Space>
      //     </Typography.Text>
      //   ),
      //   key: "delete",
      // },
    ],
  };

  const handleSearchChange = debounce((value: string, isLoading: boolean) => {
      setSearchString(value);
      setIsLoading(isLoading);

  },1000);

  const getRecords = (sortOrder: string, orderByParam: string, searchString: any, currentPage?: number) => {
    setIsLoading(true);
    //2087
    const orderedBy = orderByParam === "lastModified" ? "modified" :  orderByParam === "modified" ? "modified" : "name"
    get(
      `v1/clm/templates?count=${recordsPerPage}&start=${currentPage}&order=${sortOrder}&orderBy=${orderedBy}&searchText=${searchString}`
    )
      .then((res: any) => {
        if (res.status === "OK") {
          if (res.response && res.response.data && res.response.data.envelopeTemplates) {
            setTotalRecords(res.response.data.totalSetSize);
            let templates = [...res.response.data.envelopeTemplates];
            setData(templates);
          }else{
            setData("");
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({
          content: "Getting Templates failed",
          type: "error",
        });
      });
  };

  useEffect(() => {
    getRecords(sortOrder, orderByName, searchString, searchString.length > 0 ? 0 : pageStart);
  }, [searchString]);

  const getColoriezedValue = (value: string) => {
    return (
      <div
        style={{
          borderRadius: 5,
          padding: 5,
          background: value === "completed" ? "#00C2471A" : "rgba(255, 152, 31, 0.1)",
        }}
      >
        <Typography
          style={{
            textTransform: "capitalize",
            textAlign: "center",
            color: value === "completed" ? "#00C247" : "#FF981F",
          }}
        >
          {value === "sent" ? "In progress" : value}
        </Typography>
      </div>
    );
  };

  const columns: TableColumnsType = [
    {
      title: "Template name",
      dataIndex: "name",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      sorter: true,
      sortOrder:
      ( sortOrder === "asc" && orderByName ===  "name" )
         ? "ascend"
         :( sortOrder === "desc" && orderByName === "name") 
         ? "descend"
         : undefined,
    },
    {
      title: "Owner Name",
      dataIndex: "owner.userName",
      render: (value: any, record: any) => record.owner.userName || <Typography.Text disabled>-</Typography.Text>,
    },
    {
      title: "Owner Email",
      dataIndex: "owner.email",
      render: (value: any, record: any) => record.owner.email || <Typography.Text disabled>-</Typography.Text>,
    },
    {
      title: "Created Date",
      dataIndex: "created",
      render: (value: any, record: any) =>
        value ? (
          <Typography.Text>{moment(value).format("DD MMM YYYY")}</Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
    },
    {
      title: "Last Modified",
      dataIndex: "lastModified",
      render: (value: any, record: any) =>
        value ? (
          <Typography.Text>{moment(value).format("DD MMM YYYY")}</Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      sorter: true,
      defaultSortOrder: 'ascend' as SortOrder, 
      sortDirections: ['ascend', 'descend'],
      sortOrder:
       ( sortOrder === "asc" && (orderByName ===  "" || orderByName !== "name") )
          ? "ascend"
          :( sortOrder === "desc" && orderByName !== "name") 
          ? "descend"
          : undefined,
    },
  ];

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
    setOrderByName(column.dataIndex === "lastModified" ? "modified": "name");
    getRecords(order, column.dataIndex, searchString, pageStart);
  };




  return (
    <ContentWrapper
      title={"Templates"}
      actionItems={
        (hasPermissions([permissions.ADD_CONTRACT]) || hasRole("CLM_USER")) && (
          <Button
            type="primary"
            onClick={() => navigate("/clm/templates/create")}
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
        tableData={data ? data?.map((d: any, index: number) => {
          return {
            ...d,
            key: d.templateId,
            created: moment(d.created).format("YYYY-MM-DD"),
            lastModified: moment(d.lastModified).format("YYYY-MM-DD"),
          };
        }) : null}
        // {...{
        //   tableActions: tableActions,
        // }}
        tableActions={tableActions}
        isLoading={false}
        exportFileName="Templates"
        onClick={(record) => navigate(`/clm/templates/view/${record.templateId}`)}
        onSearchChange={handleSearchChange}
        isServerSearchApi={true}
        inputDisable={isLoading}
        isPagination={true}
      />

      <div className="pagination">
        <Pagination
          defaultCurrent={1}
          total={data && totalRecords}
          onChange={(page) => {
            const pageSize = 10;
            const startIndex = (page - 1) * pageSize;

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
