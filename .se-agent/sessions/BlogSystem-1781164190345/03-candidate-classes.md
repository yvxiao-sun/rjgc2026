# 候选类识别

**步骤**: 3/6
**状态**: completed
**自检**: 未检查

---

{
  "candidateClasses": [
    {
      "className": "User",
      "description": "系统用户，包含所有角色类型的用户，可提交和审批申请",
      "coreAttributes": [
        "用户ID (userId)",
        "姓名 (name)",
        "部门 (department)",
        "职位 (position)",
        "角色 (role): 枚举值[普通员工, 部门主管, 财务人员, 总经理, 财务总监, 系统管理员]"
      ],
      "responsibilities": [
        "提交审批申请",
        "审批待处理的申请",
        "查看个人申请历史和审批历史",
        "管理个人基本信息"
      ]
    },
    {
      "className": "ApprovalType",
      "description": "审批类型定义，包含表单模板和流程配置，支持自定义扩展",
      "coreAttributes": [
        "类型ID (typeId)",
        "类型名称 (typeName): 如请假、报销、采购、出差、加班",
        "描述 (description)",
        "表单模板 (formTemplate): JSON格式定义表单字段",
        "流程图定义 (flowDefinition): JSON格式定义审批节点和流转规则"
      ],
      "responsibilities": [
        "定义审批申请的表单结构",
        "定义审批流程的节点和流转规则",
        "支持条件分支、会签、或签等复杂流程配置",
        "作为审批申请的模板"
      ]
    },
    {
      "className": "ApprovalRequest",
      "description": "审批申请实例，记录用户提交的具体审批请求及其状态",
      "coreAttributes": [
        "申请ID (requestId)",
        "申请编号 (requestNumber): 自动生成的唯一编号",
        "审批类型 (approvalType): 关联ApprovalType",
        "申请人ID (applicantId): 关联User",
        "申请标题 (title)",
        "申请内容 (content)",
        "金额 (amount): 报销、采购类申请使用",
        "请假天数 (leaveDays): 请假类申请使用",
        "申请时间 (applyTime)",
        "状态 (status): 枚举值[草稿, 审批中, 已通过, 已驳回, 已取消, 已完成]"
      ],
      "responsibilities": [
        "记录审批申请的完整信息",
        "维护申请的生命周期状态",
        "关联审批节点记录和附件",
        "提供申请详情查询"
      ]
    },
    {
      "className": "ApprovalNode",
      "description": "审批节点实例，记录审批流程中每个节点的处理结果",
      "coreAttributes": [
        "节点ID (nodeId)",
        "申请ID (requestId): 关联ApprovalRequest",
        "节点名称 (nodeName): 如部门主管审批、财务审批",
        "审批人ID (approverId): 关联User",
        "审批状态 (status): 枚举值[待审批, 通过, 驳回, 转交]",
        "审批意见 (comment)",
        "审批时间 (approveTime)",
        "节点顺序 (nodeOrder): 流程中的排序序号"
      ],
      "responsibilities": [
        "记录每个审批节点的处理结果",
        "维护审批流程的进度",
        "支持审批意见的追溯",
        "记录转交操作的历史"
      ]
    },
    {
      "className": "Attachment",
      "description": "审批申请的附件文件，支持多种文件类型上传",
      "coreAttributes": [
        "附件ID (attachmentId)",
        "申请ID (requestId): 关联ApprovalRequest",
        "文件名 (fileName)",
        "文件路径 (filePath)",
        "文件大小 (fileSize)",
        "上传时间 (uploadTime)"
      ],
      "responsibilities": [
        "存储审批申请的证明文件",
        "提供文件下载和预览功能",
        "支持文件类型校验"
      ]
    },
    {
      "className": "FlowDefinition",
      "description": "流程定义，描述审批类型的节点配置和流转规则",
      "coreAttributes": [
        "流程定义ID (flowId)",
        "审批类型ID (typeId): 关联ApprovalType",
        "节点列表 (nodes): 包含多个FlowNode配置",
        "条件规则 (conditionRules): JSON格式定义分支条件",
        "会签/或签配置 (signMode): 枚举值[会签, 或签]"
      ],
      "responsibilities": [
        "定义审批流程的结构",
        "配置条件分支逻辑",
        "定义会签和或签模式",
        "作为审批节点实例化的模板"
      ]
    },
    {
      "className": "FlowNode",
      "description": "流程节点定义，描述审批流程中每个节点的配置信息",
      "coreAttributes": [
        "节点定义ID (nodeDefId)",
        "流程定义ID (flowId): 关联FlowDefinition",
        "节点名称 (nodeName)",
        "审批角色 (approverRole): 如部门主管、财务人员",
        "节点顺序 (nodeOrder)",
        "超时配置 (timeoutConfig): 可选，审批超时自动处理",
        "是否必签 (required): 布尔值，会签模式下使用"
      ],
      "responsibilities": [
        "定义审批节点的基本属性",
        "指定节点的审批人角色",
        "配置节点的顺序和依赖关系"
      ]
    },
    {
      "className": "ApprovalHistory",
      "description": "审批操作历史记录，用于审计和追溯",
      "coreAttributes": [
        "历史ID (historyId)",
        "申请ID (requestId): 关联ApprovalRequest",
        "操作人ID (operatorId): 关联User",
        "操作类型 (operationType): 枚举值[提交, 通过, 驳回, 转交, 取消, 修改]",
        "操作时间 (operationTime)",
        "操作详情 (detail): 如审批意见、转交原因等"
      ],
      "responsibilities": [
        "记录所有审批操作的审计日志",
        "支持审批流程的追溯查询",
        "提供操作统计和分析数据"
      ]
    },
    {
      "className": "Notification",
      "description": "通知消息，用于向用户发送审批相关的待办和状态变更通知",
      "coreAttributes": [
        "通知ID (notificationId)",
        "接收人ID (receiverId): 关联User",
        "申请ID (requestId): 关联ApprovalRequest",
        "通知类型 (type): 枚举值[待审批通知, 审批结果通知, 转交通知]",
        "消息内容 (message)",
        "是否已读 (isRead): 布尔值",
        "创建时间 (createTime)"
      ],
      "responsibilities": [
        "向审批人发送待审批通知",
        "向申请人发送审批结果通知",
        "管理通知的已读/未读状态",
        "支持通知列表查询"
      ]
    }
  ],
  "summary": "共识别出9个候选类，涵盖了用户管理、审批类型配置、申请提交、审批处理、流程定义、附件管理、操作审计和通知推送等核心领域。这些类构成了企业审批工作流系统的基础领域模型，能够支持需求文档中描述的所有功能场景。"
}