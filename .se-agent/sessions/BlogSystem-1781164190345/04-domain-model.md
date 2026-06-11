# 领域模型

**步骤**: 4/6
**状态**: completed
**自检**: 未检查

---

## Mermaid 类图

```mermaid
classDiagram
    class User {
        +String userId
        +String name
        +String department
        +String position
        +String role
        +submitRequest()
        +approveRequest()
        +viewHistory()
    }

    class ApprovalType {
        +String typeId
        +String typeName
        +String description
        +JSON formTemplate
        +JSON flowDefinition
        +createType()
        +updateType()
        +deleteType()
    }

    class ApprovalRequest {
        +String requestId
        +String requestNumber
        +String title
        +String content
        +Double amount
        +Integer leaveDays
        +DateTime applyTime
        +String status
        +submit()
        +cancel()
        +resubmit()
    }

    class ApprovalNode {
        +String nodeId
        +String nodeName
        +String status
        +String comment
        +DateTime approveTime
        +Integer nodeOrder
        +approve()
        +reject()
        +transfer()
    }

    class Attachment {
        +String attachmentId
        +String fileName
        +String filePath
        +Long fileSize
        +DateTime uploadTime
        +download()
        +preview()
    }

    class FlowDefinition {
        +String flowId
        +JSON conditionRules
        +String signMode
        +addNode()
        +removeNode()
        +setCondition()
    }

    class FlowNode {
        +String nodeDefId
        +String nodeName
        +String approverRole
        +Integer nodeOrder
        +JSON timeoutConfig
        +Boolean required
    }

    class ApprovalHistory {
        +String historyId
        +String operationType
        +DateTime operationTime
        +String detail
        +queryHistory()
    }

    class Notification {
        +String notificationId
        +String type
        +String message
        +Boolean isRead
        +DateTime createTime
        +markAsRead()
        +sendNotification()
    }

    %% 关联关系
    User "1" --> "*" ApprovalRequest : 提交
    User "1" --> "*" ApprovalNode : 审批
    User "1" --> "*" ApprovalHistory : 操作
    User "1" --> "*" Notification : 接收

    ApprovalType "1" --> "*" ApprovalRequest : 分类
    ApprovalType "1" --> "1" FlowDefinition : 定义流程

    ApprovalRequest "1" --> "*" ApprovalNode : 包含
    ApprovalRequest "1" --> "*" Attachment : 包含
    ApprovalRequest "1" --> "*" ApprovalHistory : 产生
    ApprovalRequest "1" --> "*" Notification : 触发

    FlowDefinition "1" --> "*" FlowNode : 包含

    %% 聚合关系
    ApprovalRequest o-- ApprovalNode : 聚合
    ApprovalRequest o-- Attachment : 聚合

    %% 组合关系
    FlowDefinition *-- FlowNode : 组合

    %% 依赖关系
    ApprovalNode ..> User : 依赖
    ApprovalNode ..> ApprovalRequest : 依赖
    ApprovalHistory ..> User : 依赖
    ApprovalHistory ..> ApprovalRequest : 依赖
    Notification ..> User : 依赖
    Notification ..> ApprovalRequest : 依赖
```

## 类关系

- **User** 关联 **ApprovalRequest** (1对多)
- **User** 关联 **ApprovalNode** (1对多)
- **User** 关联 **ApprovalHistory** (1对多)
- **User** 关联 **Notification** (1对多)
- **ApprovalType** 关联 **ApprovalRequest** (1对多)
- **ApprovalType** 关联 **FlowDefinition** (1对1)
- **ApprovalRequest** 聚合 **ApprovalNode** (1对多)
- **ApprovalRequest** 聚合 **Attachment** (1对多)
- **FlowDefinition** 组合 **FlowNode** (1对多)
- **ApprovalRequest** 关联 **ApprovalHistory** (1对多)
- **ApprovalRequest** 关联 **Notification** (1对多)
- **ApprovalNode** 依赖 **User** (多对1)
- **ApprovalNode** 依赖 **ApprovalRequest** (多对1)
- **ApprovalHistory** 依赖 **User** (多对1)
- **ApprovalHistory** 依赖 **ApprovalRequest** (多对1)
- **Notification** 依赖 **User** (多对1)
- **Notification** 依赖 **ApprovalRequest** (多对1)

