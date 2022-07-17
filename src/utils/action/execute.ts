import store from "@/store"
import { AxiosResponse, AxiosError } from "axios"
import { actionActions } from "@/redux/currentApp/action/actionSlice"
import { Api } from "@/api/base"
import { ActionItem } from "@/redux/currentApp/action/actionState"
import { ACTION_TYPE } from "@/page/App/components/ActionEditor/constant"
import {
  PrepareQueryPerformance,
  getResourcePerformance,
} from "@/utils/action/performance"
import { errorHandler } from "@/utils/action/errorHandler"

export function executeAction(
  action: ActionItem,
  appID: string,
  success?: (response: AxiosResponse) => void,
  failure?: (response: AxiosResponse) => void,
  crash?: (error: AxiosError) => void,
  loadingCallback?: (loading: boolean) => void,
) {
  PrepareQueryPerformance.start(action.actionId)

  const url = `${import.meta.env.VITE_API_BASE_URL}/apps/${appID}/actions/${
    action.actionId
  }/run`
  const resourceIndex = performance.getEntriesByName(url).length

  const { actionId, resourceId, actionType, actionTemplate, displayName } =
    action

  if (actionType === "transformer") {
    // TODO: eval transfomer
    // save to redux
    store.dispatch(
      actionActions.updateActionItemReducer({
        ...action,
        // TODO: apply Transfomer
        data: {},
        rawData: {},
        error: false,
      }),
    )
    return
  }

  Api.request(
    {
      url: `/apps/${appID}/actions/${actionId}/run`,
      method: "POST",
      data: {
        resourceId,
        actionType,
        actionTemplate,
        displayName,
      },
      // TODO: @spike temporay set `User-Agent` in headers,
      // will be removed after handle by server later
      transformRequest: [
        function (data) {
          if (actionType === ACTION_TYPE.REST_API) {
            data.actionTemplate.headers = [
              ...data.actionTemplate.headers,
              ["User-Agent", navigator.userAgent],
            ]
          }

          return JSON.stringify(data)
        },
        function (data) {
          PrepareQueryPerformance.end(action.actionId)
          return data
        },
      ],
    },
    (response) => {
      // TODO: eval transfomer
      // save rawData & transformData to redux
      store.dispatch(
        actionActions.updateActionItemReducer({
          ...action,
          // TODO: apply Transfomer
          data: response.data,
          rawData: response.data,
          error: false,
          runtime: {
            ...action.runtime,
            ...getResourcePerformance(url, resourceIndex),
            prepareQuery:
              PrepareQueryPerformance.measure(action.actionId) ?? undefined,
          },
        }),
      )
      store.dispatch(
        actionActions.updateActionTemplateReducer({
          actionId,
          actionTemplate: {
            ...actionTemplate,
            data: response.data,
            rawData: response.data,
          },
        }),
      )

      // TODO: trigger success eventhandler
      success?.(response)
    },
    (response) => {
      // save rawData to redux
      store.dispatch(
        actionActions.updateActionItemReducer({
          ...action,
          // TODO: apply Transfomer
          data: response.data,
          rawData: response.data,
          error: true,
          runtime: {
            ...action.runtime,
            ...getResourcePerformance(url, resourceIndex),
            prepareQuery:
              PrepareQueryPerformance.measure(action.actionId) ?? undefined,
          },
        }),
      )

      store.dispatch(
        actionActions.updateActionTemplateReducer({
          actionId,
          actionTemplate: {
            ...actionTemplate,
            data: response.data,
            rawData: response.data,
          },
        }),
      )

      errorHandler(action, response)

      // TODO: trigger error eventhandler

      failure?.(response)
    },
    (error) => {
      crash?.(error)
    },
    (loading) => {
      loadingCallback?.(loading)
    },
  )
}