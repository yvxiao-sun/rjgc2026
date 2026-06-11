# 状态机图

**步骤**: 5/6
**状态**: completed
**自检**: 未检查

---

## 状态机图 1: 未命名

**描述**: 文章从创建到删除的完整生命周期，包含草稿、发布、审核等状态

```mermaid
stateDiagram-v2
    [*] --> Draft : 创建文章
    Draft --> Published : 发布
    Draft --> Deleted : 删除草稿
    Published --> Draft : 撤回为草稿
    Published --> Archived : 归档
    Published --> Deleted : 删除
    Archived --> Published : 重新发布
    Archived --> Deleted : 删除
    Deleted --> [*] : 永久删除

    state Draft {
        [*] --> Editing
        Editing --> Editing : 保存修改
        Editing --> Preview : 预览
        Preview --> Editing : 继续编辑
    }

    state Published {
        [*] --> Visible
        Visible --> Visible : 更新内容
        Visible --> Hidden : 隐藏
        Hidden --> Visible : 显示
    }

    state Archived {
        [*] --> Inactive
        Inactive --> Inactive : 只读
    }```

---

## 状态机图 2: 未命名

**描述**: 评论从创建到删除的生命周期，包含审核、回复等状态转换

```mermaid
stateDiagram-v2
    [*] --> Pending : 提交评论
    Pending --> Approved : 审核通过
    Pending --> Rejected : 审核拒绝
    Pending --> Deleted : 用户删除
    Approved --> Deleted : 用户/管理员删除
    Approved --> Spam : 标记为垃圾
    Spam --> Approved : 取消垃圾标记
    Spam --> Deleted : 删除
    Rejected --> [*] : 丢弃
    Deleted --> [*] : 永久删除

    state Approved {
        [*] --> Visible
        Visible --> Visible : 被回复
        Visible --> Hidden : 折叠
        Hidden --> Visible : 展开
    }

    state Pending {
        [*] --> AwaitingReview
        AwaitingReview --> AwaitingReview : 等待审核
    }```

---

## 状态机图 3: 未命名

**描述**: 用户账号从注册到注销的完整生命周期，包含角色变更和账号状态管理

```mermaid
stateDiagram-v2
    [*] --> Registered : 完成注册
    Registered --> Active : 邮箱验证
    Registered --> Inactive : 未验证
    Active --> Inactive : 长时间未登录
    Inactive --> Active : 重新登录
    Active --> Banned : 管理员封禁
    Banned --> Active : 管理员解封
    Active --> Deleted : 用户注销
    Banned --> Deleted : 管理员删除
    Deleted --> [*] : 账号移除

    state Active {
        [*] --> Normal
        Normal --> Author : 升级为作者
        Author --> Admin : 升级为管理员
        Admin --> Author : 降级
        Author --> Normal : 降级
    }

    state Banned {
        [*] --> Temporary
        Temporary --> Permanent : 多次违规
        Permanent --> [*] : 永久封禁
    }```

---

