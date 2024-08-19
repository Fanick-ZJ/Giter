
import { ElInput, ElMessageBox } from "element-plus";
import RepoInfoEditDialog, { Expose } from "./index.vue";
import i18n from "@/renderer/lang";
import { RepoItem } from "@/types";
import { createVNode, toRaw } from "vue";
import { RepoStoreItem, useRepoStore } from "@/renderer/store/modules/repository";
import { RepoTaskService } from "@/renderer/common/entity/repoTaskService";

export default (repo: RepoStoreItem) => {
  let expose = {} as Expose
  const store = useRepoStore()
  const Comp = <RepoInfoEditDialog repo={repo} expose={(e) => {expose = e}}></RepoInfoEditDialog>
  const repoService = new RepoTaskService()
  return ElMessageBox({
      title: i18n.global.t('dialog.repoInfoEditorDialogTitle'),
      distinguishCancelAndClose: true,
      closeOnPressEscape: false,
      closeOnClickModal: false,
      message: Comp
    }).then(data => {
      const repo = toRaw(expose.repo)
      repoService.updateRepo(repo)
      store.add(repo)
    }).finally(() => {
      repoService.interrupt()
    })
}