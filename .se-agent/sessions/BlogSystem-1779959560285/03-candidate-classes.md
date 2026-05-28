# 候选类识别

**步骤**: 3/6
**状态**: completed
**自检**: 未检查

---

{
  "candidateClasses": [
    {
      "className": "User",
      "description": "系统用户，包含所有角色类型的用户，可以提交申请或审批申请",
      "coreAttributes": [
        "userId: String - 用户唯一标识",
        "name: String - 用户姓名",
        "department: String - 所属部门",
        "position: String - 职位",
        "role: Enum - 用户角色（普通员工、部门主管、财务人员、总经理、系统管理员）"
      ],
      "responsibilities": [
        "提交审批申请",
        "审批分配给自己的申请",
        "查看自己的申请记录和待审批列表",
        "管理审批类型配置（仅系统管理员）"
      ]
    },
    {
      "className": "ApprovalType",
      "description": "审批类型定义，描述一种审批流程的模板，包含表单定义和流程定义",
      "coreAttributes": [
        "typeId: String - 类型唯一标识",
        "typeName: String - 类型名称（如请假、报销）",
        "description: String - 类型描述",
        "formTemplate: JSON - 表单字段模板定义（字段名、类型、是否必填等）",
        "workflowDefinition: JSON - 流程图定义（节点列表、顺序、条件分支、会签/或签规则）"
      ],
      "responsibilities": [
        "定义审批申请需要填写的表单结构",
        "定义审批流程的节点顺序和流转规则",
        "作为审批申请的模板来源"
      ]
    },
    {
      "className": "ApprovalRequest",
      "description": "审批申请实例，用户提交的具体申请，包含表单数据和审批状态",
      "coreAttributes": [
        "requestId: String - 申请唯一标识",
        "requestNumber: String - 申请编号（业务编号）",
        "approvalTypeId: String - 关联的审批类型ID",
        "applicantId: String - 申请人用户ID",
        "title: String - 申请标题",
        "content: String - 申请内容",
        "amount: Decimal - 金额（报销、采购类使用）",
        "leaveDays: Integer - 请假天数（请假类使用）",
        "submitTime: DateTime - 提交时间",
        "status: Enum - 申请状态（草稿、审批中、已通过、已驳回、已取消、已完成）",
        "formData: JSON - 表单字段实际值"
      ],
      "responsibilities": [
        "存储用户提交的申请数据",
        "维护申请的生命周期状态",
        "关联审批节点记录和附件",
        "提供申请详情查询"
      ]
    },
    {
      "className": "ApprovalNode",
      "description": "审批节点实例，记录审批流程中每个节点的处理情况",
      "coreAttributes": [
        "nodeId: String - 节点唯一标识",
        "requestId: String - 所属申请ID",
        "nodeName: String - 节点名称（如部门主管审批）",
        "approverId: String - 审批人用户ID",
        "approvalStatus: Enum - 节点状态（待审批、已通过、已驳回、已转交）",
        "approvalComment: String - 审批意见",
        "approvalTime: DateTime - 审批时间",
        "nodeOrder: Integer - 节点顺序号",
        "isCounterSign: Boolean - 是否会签节点",
        "isOrSign: Boolean - 是否或签节点"
      ],
      "responsibilities": [
        "记录每个审批节点的处理结果",
        "跟踪当前流程执行到哪个节点",
        "存储审批人的意见和时间",
        "支持会签/或签的多人审批场景"
      ]
    },
    {
      "className": "Attachment",
      "description": "申请附件，存储用户上传的证明文件",
      "coreAttributes": [
        "attachmentId: String - 附件唯一标识",
        "requestId: String - 所属申请ID",
        "fileName: String - 文件名",
        "filePath: String - 文件存储路径",
        "fileSize: Long - 文件大小",
        "uploadTime: DateTime - 上传时间"
      ],
      "responsibilities": [
        "存储申请相关的证明文件",
        "提供文件下载和预览功能",
        "关联到具体的审批申请"
      ]
    },
    {
      "className": "WorkflowEngine",
      "description": "工作流引擎，负责根据流程定义自动流转审批节点",
      "coreAttributes": [
        "engineId: String - 引擎实例标识",
        "currentRequestId: String - 当前处理的申请ID",
        "currentNodeId: String - 当前执行的节点ID",
        "workflowContext: JSON - 流程上下文（金额、天数等条件变量）"
      ],
      "responsibilities": [
        "根据审批类型的流程定义自动创建下一个审批节点",
        "根据条件分支判断流转路径（如金额判断）",
        "处理会签/或签的逻辑（等待所有审批人或任一审批人通过）",
        "触发状态变更通知",
        "执行审批通过后的后续业务动作（如打款、备案）"
      ]
    },
    {
      "className": "Notification",
      "description": "通知记录，存储系统发送给用户的通知消息",
      "coreAttributes": [
        "notificationId: String - 通知唯一标识",
        "userId: String - 接收通知的用户ID",
        "requestId: String - 关联的申请ID",
        "type: Enum - 通知类型（待审批通知、驳回通知、通过通知、转交通知）",
        "content: String - 通知内容",
        "isRead: Boolean - 是否已读",
        "createTime: DateTime - 创建时间"
      ],
      "responsibilities": [
        "记录系统发送的所有通知",
        "提供用户未读通知查询",
        "支持通知已读标记"
      ]
    }
  ]
}