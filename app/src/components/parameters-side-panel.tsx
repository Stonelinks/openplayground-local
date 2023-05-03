import React, { useContext } from "react"
import { Checkbox } from "./ui/checkbox"
import { useBreakpoint } from "../hooks/use-breakpoint"
import ParameterSlider from "./parameter-slider"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import MultiSelect from "./multi-select"
import { uuid } from "uuidv4"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip"
import { ParametersContext, ModelsContext, ModelsStateContext } from "../app"
import { BarChart2, Copy, Trash2, Filter } from "lucide-react"
import { MODEL_PROVIDERS, handleSelectModel } from "../lib/utils"


const ParametersSidePanel = ({ showModelDropdown, showModelList }) => {
  const { isLg } = useBreakpoint("lg")
  const { parametersContext, setParametersContext } = useContext(ParametersContext)
  const { modelsContext, setModelsContext } = useContext(ModelsContext)
  const { modelsStateContext, setModelsStateContext } = useContext(ModelsStateContext)

  const [modelSearchValue, setModelSearchValue] = React.useState<string>("")
 
  const number_of_models_selected = modelsStateContext.filter(
    (modelState) => modelState.selected
  ).length
  const number_of_models_enabled = modelsStateContext.filter(
    (modelState) => modelState.enabled
  ).length
  
  const models_shared_keys = Object.keys(modelsContext).length === 0 ? {} : modelsStateContext
    .filter(
      (modelState) =>
        modelState.enabled &&
        (number_of_models_selected >= 1 ? modelState.selected : true)
    )
    .map((modelState) => (modelsContext[modelState.name].defaultParameters))
    .flatMap((parameter) =>
      Object.entries(parameter).map(([key, parameter]) => ({
        key,
        range: parameter["range"],
      }))
    )
    .reduce((acc, { key, range }) => {
      acc[key] = acc[key] || { range: [] }
      acc[key].range = [...new Set([...acc[key].range, ...range])]
      return acc
    }, {})
  
  const generate_parameters_sliders = () => {
    return [

    // The maximum number of tokens to generate.
    // :ivar max_tokens:
    // :vartype max_tokens: int
    // "maximumLength": {"value": 200, "range": [50, 2048]},
      {
        title: "Maximum Length",
        name: "maximumLength",
        type: "number",
        step: 1,
        tooltipContent: (
          <p>
            Maximum number of tokens to generate. <br /> Responses are not
            guaranted to fill up <br /> to the maximum desired length. <br />
          </p>
        ),
        normalizeFn: (value) => parseInt(value),
      },

    // Adjust the randomness of the generated text.
    // Temperature is a hyperparameter that controls the randomness of the generated text. It affects
    // the probability distribution of the model's output tokens. A higher temperature (e.g., 1.5)
    // makes the output more random and creative, while a lower temperature (e.g., 0.5) makes the
    // output more focused, deterministic, and conservative. The default value is 0.8, which provides
    // a balance between randomness and determinism. At the extreme, a temperature of 0 will always
    // pick the most likely next token, leading to identical outputs in each run.
    // :ivar temperature:
    // :vartype temperature: float
    // "temperature": {"value": 1, "range": [0.0, 2]},
      {
        title: "Temperature",
        name: "temperature",
        type: "number",
        step: 0.01,
        tooltipContent: (
          <p>
            A non-negative float that tunes the degree <br /> of randomness in
            generation. Lower <br />
            temperatures mean less random generations.
            <br />
            <br />
            Temperature is a hyperparameter that controls the randomness of the generated text. It affects <br />
            the probability distribution of the model's output tokens. A higher temperature (e.g., 1.5) <br />
            makes the output more random and creative, while a lower temperature (e.g., 0.5) makes the <br />
            output more focused, deterministic, and conservative. The default value is 0.8, which provides <br />
            a balance between randomness and determinism. At the extreme, a temperature of 0 will always <br />
            pick the most likely next token, leading to identical outputs in each run. <br />
          </p>
        ),
        normalizeFn: (value) => parseFloat(value),
      },

    // Limit the next token selection to a subset of tokens with a cumulative probability above a threshold P.
    // Top-p sampling, also known as nucleus sampling, is another text generation method that selects
    // the next token from a subset of tokens that together have a cumulative probability of at least
    // p. This method provides a balance between diversity and quality by considering both the
    // probabilities of tokens and the number of tokens to sample from. A higher value for top_p
    // (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more
    // focused and conservative text.
    // :ivar top_p:
    // :vartype top_p: float
    // "topP": {"value": 1, "range": [0.0, 1]},
      {
        title: "Top P",
        name: "topP",
        type: "number",
        step: 0.01,
        tooltipContent: (
          <p>
            If set to float less than 1, only the smallest <br /> set of most
            probable tokens with probabilities <br /> that add up to top_p or
            higher are kept for
            <br /> generation. <br />

          Limit the next token selection to a subset of tokens with a cumulative probability above a threshold P. <br />
          Top-p sampling, also known as nucleus sampling, is another text generation method that selects <br />
          the next token from a subset of tokens that together have a cumulative probability of at least <br />
          p. This method provides a balance between diversity and quality by considering both the <br />
          probabilities of tokens and the number of tokens to sample from. A higher value for top_p <br />
          (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more <br />
          focused and conservative text. <br />
          </p>
        ),
        normalizeFn: (value) => parseFloat(value),
      },

    // Limit the next token selection to the K most probable tokens.
    // Top-k sampling is a text generation method that selects the next token only from the top k
    // most likely tokens predicted by the model. It helps reduce the risk of generating
    // low-probability or nonsensical tokens, but it may also limit the diversity of the output. A
    // higher value for top_k (e.g., 100) will consider more tokens and lead to more diverse text,
    // while a lower value (e.g., 10) will focus on the most probable tokens and generate more
    // conservative text.
    // :ivar top_k:
    // :vartype top_k: int
    // "topK": {"value": 0, "range": [0, 100]},
      {
        title: "Top K",
        name: "topK",
        type: "number",
        step: 1,
        tooltipContent: (
          <p>
            Can be used to reduce repetitiveness of <br />
            generated tokens. The higher the value,
            <br /> the stronger a penalty is applied to
            <br />
            previously present tokens, proportional
            <br /> to how many times they have already
            <br /> appeared in the prompt or prior generation. <br />
          </p>
        ),
        normalizeFn: (value) => parseInt(value),
      },
      
    // A penalty applied to each token that is already generated. This helps prevent the model from repeating itself.
    // Repeat penalty is a hyperparameter used to penalize the repetition of token sequences during
    // text generation. It helps prevent the model from generating repetitive or monotonous text. A
    // higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g.,
    // 0.9) will be more lenient.
    // :ivar repeat_penalty:
    // :vartype repeat_penalty: float
    // "repetitionPenalty": {"value": 1, "range": [0, 2]},
      {
        title: "Repetition Penalty",
        name: "repetitionPenalty",
        type: "number",
        step: 0.01,
        tooltipContent: (
          <p>
            Akin to presence penalty. The repetition penalty is meant <br /> to
            avoid sentences that repeat themselves without <br /> anything
            really interesting.{" "}
          </p>
        ),
        normalizeFn: (value) => parseFloat(value),
      },

    // These are undocumented parameters only supported by our llm server implementation
    // "contextSize": {"value": 2048, "range": [0, 2048]},
      {
        title: "Context Size",
        name: "contextSize",
        type: "number",
        step: 1,
        tooltipContent: (
          <p>
            The size of the context window for the model. <br />
            For LLama models this can't be larger than 2048. <br />
          </p>
        ),
        normalizeFn: (value) => parseInt(value),
      },

    // "batchSize": {"value": 48, "range": [0, 2048]},
      {
        title: "Batch Size",
        name: "batchSize",
        type: "number",
        step: 1,
        tooltipContent: (
          <p>
            The batch size for the model. <br />
            If using GPU (e.g. cublas) this should be large (like 512). <br />
            If using CPU this should be small (like 8-100). <br />
          </p>
        ),
        normalizeFn: (value) => parseInt(value),
      },


    // "threads": {
    //     # "value": max((os.cpu_count() or 2) // 2, 1),
    //     # "range": [0, os.cpu_count()],
    // },
      {
          
        title: "Threads",
        name: "threads",
        type: "number",
        step: 1,
        tooltipContent: (
          <p>
            The number of threads to use for the model inference server. <br />
            This should be set to the number of CPU cores available. <br />
            If doing multiple concurrent inferences, you could end up with <br />
            more threads than cores, this will likely slow down inference. <br />
          </p>
        ),
        normalizeFn: (value) => parseInt(value),
      },


    // "f16kv": {"value": False, "range": [False, True]},
      {
        title: "F16KV",
        name: "f16kv",
        type: "boolean",
        tooltipContent: (
          <p>
            Whether to use 16-bit keys and values for the model. <br />
            This will reduce the memory usage of the model, but <br />
            may reduce the quality of the generated text. <br />
          </p>
        ),
        normalizeFn: (value) => value === "true",
      },
    // "useMlock": {"value": False, "range": [False, True]},
      {
        title: "Use Mlock",   
        name: "useMlock",
        type: "boolean",
        tooltipContent: (
          <p>
            Whether to use mlock to lock the model in memory. <br />
            The inference server could fail to start if the model <br />
            is too large to fit in memory. <br />
          </p>
        ),
        normalizeFn: (value) => value === "true",
      },

    // "useMmap": {"value": True, "range": [False, True]},
      {
        title: "Use Mmap",
        name: "useMmap",
        type: "boolean",
        tooltipContent: (
          <p>
            Whether to use mmap to map the model into memory. <br />
            I honestly have no idea what this does but seems good. <br />
          </p>
        ),
        normalizeFn: (value) => value === "true",
      },

      // -------------------------

      {
        title: "Frequency Penalty",
        name: "frequencyPenalty",
        type: "number",
        step: 0.01,
        tooltipContent: (
          <p>
            Can be used to reduce repetitiveness of <br />
            generated tokens. The higher the value,
            <br /> the stronger a penalty is applied to
            <br />
            previously present tokens, proportional
            <br /> to how many times they have already
            <br /> appeared in the prompt or prior generation.
          </p>
        ),
        normalizeFn: (value) => parseFloat(value),
      },
      {
        title: "Presence Penalty",
        name: "presencePenalty",
        type: "number",
        step: 0.01,
        tooltipContent: (
          <p>
            Can be used to reduce repetitiveness of <br />
            generated tokens. Similar to Frequency Penalty,
            <br /> except that this penalty is applied equally <br /> to all
            tokens that have already appeared,
            <br />
            regardless of their <br /> exact frequencies. <br />
          </p>
        ),
        normalizeFn: (value) => parseFloat(value),
      },

    ]
      .filter((parameter) => parameter.name in models_shared_keys)
      .map((parameter) => ({
        ...parameter,
        value: parametersContext[parameter.name],
        min: models_shared_keys[parameter.name].range[0],
        max: models_shared_keys[parameter.name].range[1],
        disabled:
          number_of_models_enabled === 0 ||
          models_shared_keys[parameter.name].range.length > 2,
      }))
      .map((parameter) => {
        return (
          <ParameterSlider
            key={parameter.name}
            title={parameter.title}
            type={parameter.type}
            defaultValue={parameter.value}
            disabled={parameter.disabled}
            onChangeValue={(value: number) => {
              setModelsStateContext(
                modelsStateContext.map((modelState: any) => {
                  if (
                    modelState.parameters[parameter.name] &&
                    (number_of_models_selected === 0 || modelState.selected)
                  ) {
                    modelState.parameters[parameter.name] = value
                  }

                  return modelState
                })
              )
              setParametersContext({
                ...parametersContext,
                [parameter.name]: value,
              })
            }}
            min={parameter.min}
            max={parameter.max}
            step={parameter.step}
            normalizeInputData={parameter.normalizeFn}
            tooltipContent={
              <>
                {parameter.tooltipContent}
                {number_of_models_enabled === 0 ? (
                  <p>
                    <b>Disabled:</b> no models have been enabled.
                  </p>
                ) : parameter.disabled ? (
                  <p>
                    <b>Disabled:</b> the range of values for this parameter
                    <br /> <b>is not</b> uniform across all models.
                    <br />
                    <b>Tip:</b> to edit similar models, tap the models on
                    <br /> the list or select them by clicking their name
                    <br /> above their respective editor.
                  </p>
                ) : null}
              </>
            }
          />
        )
      })
  }

  const generate_card = (modelState: any) => {
    return (
      <div
        key={`selected_${modelState.tag}`}
        className={`relative select-none my-2 flex justify-center items-center rounded-md border border-slate-200 font-mono text-sm dark:border-slate-700 overflow-hidden ${
          modelState.selected ? "bg-slate-200 dark:bg-slate-200" : ""
        } ${
          modelState.enabled
            ? "cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-200"
            : ""
        }`}
      >
        <div
          className={`pl-4 py-3 flex-1 overflow-hidden ${
            !modelState.enabled ? "text-zinc-400" : ""
          }`}
          onClick={(event) => {
            if (modelState.enabled)
              handleSelectModel(
                modelState,
                modelsStateContext,
                setModelsStateContext,
                parametersContext,
                setParametersContext,
                event.ctrlKey || event.metaKey
              )
          }}
        >
          {modelState.name.split(":")[1]}
          <br />
          <span style={{ fontSize: "12px" }}>
            Provider: <i>{modelState.provider}</i>
          </span>
          <br />
        </div>

        <Copy
          size={10}
          className="absolute top-2 right-2"
          onClick={() => {
            const index_of_model = modelsStateContext.findIndex(
              (m: any) => m.name === modelState.name
            )
            const name_fragments = modelState.name.split(":")
            setModelsStateContext([
              ...modelsStateContext.slice(0, index_of_model + 1),
              {
                ...modelState,
                is_clone: true,
                tag: `${name_fragments[0]}:${name_fragments[1]}:${uuid()}`,
              },
              ...modelsStateContext.slice(index_of_model + 1),
            ])
          }}
        />

        <Checkbox
          className="mr-6"
          key={modelState.tag}
          checked={modelState.enabled}
          onCheckedChange={(val: boolean) => {
            setModelsStateContext(
              modelsStateContext.map((m: any) => {
                if (m.tag === modelState.tag) {
                  return {
                    ...m,
                    enabled: val,
                    selected: false
                  }
                }
                return m
              })
            )
          }}
        />
        {modelState.is_clone ? (
          <Trash2
            size={10}
            className="absolute bottom-2 right-2"
            onClick={() => {
              setModelsStateContext(
                modelsStateContext.filter((m: any) => m.tag !== modelState.tag)
              )
            }}
          />
        ) : null}
      </div>
    )
  }

  const generate_list = () => {
    if (!showModelList) return null

    return (
      <>
        <div>
          <div className="my-2 flex cursor-default flex mb-1">
            <p className="flex-1 text-sm font-normal float-left align-text-top">
              Enable All
            </p>

            <Checkbox
              checked={parametersContext.selectAllModels}
              onCheckedChange={(val: boolean) => {
                setModelsStateContext(
                  modelsStateContext.map((modelState: any) => {
                    modelState.enabled = val
                    modelState.selected = false
                    return modelState
                  })
                )

                setParametersContext({
                  ...parametersContext,
                  selectAllModels: val,
                })
              }}
              className="float-right"
            />
          </div>
        </div>
        <div className="my-2 flex flex-row border-slate-300 border p-2 rounded">
          <div className="flex items-center">
            <Filter size={18} />
          </div>

          <div className="ml-2 flex-1 mr-2">
            <input
              className="outline-0 w-[100%]"
              value={modelSearchValue}
              onChange={(event) => {
                setModelSearchValue(event.target.value)
              }}
              placeholder="Model Name"
            />
          </div>
        </div>
        <div>
          <ul>
            {modelsStateContext
              .filter((modelState: any) =>
                !modelState.tag ? false :
                modelSearchValue !== ""
                  ? modelState.name
                      .toLowerCase()
                      .indexOf(modelSearchValue.toLowerCase()) !== -1
                  : true
              )
              .map(generate_card)}
          </ul>
        </div>
      </>
    )
  }

  const generate_header = () => {
    if (!showModelDropdown)
      return (
        <div className="flex mb-2">
          <span className="cursor-default flex-1 flow-root inline-block align-middle">
            <p className="text-sm font-medium float-left align-text-top">
              Parameters
            </p>
          </span>
          <Tooltip delayDuration={300} skipDelayDuration={150}>
          <TooltipTrigger asChild>
            <div
              onClick={() => {
                setParametersContext({
                  ...parametersContext,
                  showParametersTable: !parametersContext.showParametersTable,
                })
              }}
              className={`mx-1 cursor-pointer flex justify-center items-center w-[24px] h-[24px] rounded-full border-[1px] border-slate-200 select-none ${
                parametersContext.showParametersTable
                  ? "text-white bg-slate-700"
                  : "hover:text-white hover:bg-slate-700 text-slate-600 bg-white"
              }`}
            >
              <BarChart2 size={18} />
            </div>
          </TooltipTrigger>
          <TooltipContent side={"bottom"}>
            <p>Show Parameters for all models</p>
          </TooltipContent>
        </Tooltip>
        </div>
      )
    
    const selectedModel = modelsStateContext.find((modelState) => modelState.selected)
    
    return (
      <div className="">
        <div className="mb-2">
          <span className="flow-root inline-block align-middle">
            <p className="text-sm font-medium float-left align-text-top">
              Model
            </p>
          </span>
          <Select
            value={selectedModel?.name || null}
            onValueChange={(value) => {
              setModelsStateContext(
                modelsStateContext.map((model) => ({...model, selected: (model.name === value) ? true : false}))
              )
              const modelParameters = modelsStateContext.find((model) => model.name === value).parameters
              
              setParametersContext({
                temperature: modelParameters.temperature || parametersContext.temperature,
                maximumLength: modelParameters.maximumLength || parametersContext.maximumLength,
                topP: modelParameters.topP || parametersContext.topP,
                topK: modelParameters.topK || parametersContext.topK,
                frequencyPenalty: modelParameters.frequencyPenalty || parametersContext.frequencyPenalty,
                presencePenalty: modelParameters.presencePenalty || parametersContext.presencePenalty,
                repetitionPenalty: modelParameters.repetitionPenalty || parametersContext.repetitionPenalty,
                stopSequences: modelParameters.stopSequences || parametersContext.stopSequences,

                contextSize: modelParameters.contextSize || parametersContext.contextSize,
                batchSize: modelParameters.batchSize || parametersContext.batchSize,
                threads: modelParameters.threads || parametersContext.threads,
                f16kv: modelParameters.f16kv || parametersContext.f16kv,
                useMlock: modelParameters.useMlock || parametersContext.useMlock,
                useMmap: modelParameters.useMmap || parametersContext.useMmap,
              })
            }}
          >
            <SelectTrigger
              className="w-full"
              onKeyDown={(e) => {
                if (e.code === "Enter" && e.metaKey) {
                  e.preventDefault()
                }
              }}
            >
              <SelectValue placeholder="Select a Model" />
            </SelectTrigger>
            <SelectContent
              onKeyDown={(e) => {
                if (e.code === "Enter" && e.metaKey) {
                  e.preventDefault()
                }
              }}
            >
              {Object.entries(MODEL_PROVIDERS).map(([provider, prettyName]) => (
                <SelectGroup key={provider}>
                  {Object.entries(modelsContext)
                    .filter(([key]) => key.split(":")[0] === provider)
                    .map(([model_key, _], index) => {
                      if (modelsContext[model_key]) {
                        return (
                          <div key={model_key}>
                            <SelectLabel hidden={index != 0}>
                              {prettyName}
                            </SelectLabel>
                            <SelectItem
                              value={model_key}
                              onKeyDown={(e) => {
                                if (e.code === "Enter" && e.metaKey) {
                                  e.preventDefault()
                                }
                              }}
                            >
                              {model_key.split(":")[1]}
                            </SelectItem>
                          </div>
                        )
                      }
                    })}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  const generate_show_probabilities = () => {
    const selectedModel = modelsStateContext.find((modelState) => modelState.selected)
    if (!selectedModel || !selectedModel.capabilities || !selectedModel.capabilities.includes("logprobs"))
      return null
   
    return (
      <Tooltip delayDuration={300} skipDelayDuration={150}>
        <TooltipTrigger asChild>
          <div className="cursor-default flex justify-between align-middle inline-block align-middle mb-1">
            <p className="text-sm font-normal float-left align-text-top">
              Show Probabilities
            </p>
            <Checkbox
              name="show-probabilities"
              className="float-right self-center"
              checked={parametersContext.showProbabilities}
              onCheckedChange={(val: boolean) => {
                setParametersContext({
                  ...parametersContext,
                  showProbabilities: val,
                })
              }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side={isLg ? "left" : "bottom"}>
          <p>
            When enabled hover over generated words <br /> to see how likely a
            token was to be generated,
            <br /> if the model supports it.
          </p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="flex flex-col max-h-[100%] pt-4 sm:pt-4 md:pt-[0px] lg:pt-[0px]">
      <div className="mb-2">
        {generate_header()}
      </div>
      <div className="flex flex-col gap-y-3">
        {generate_parameters_sliders()}

        <MultiSelect
          onValueChange={(value: any) => {
            setModelsStateContext(
              modelsStateContext.map((modelState: any) => {
                if (
                  modelState.parameters.stopSequences &&
                  (number_of_models_selected === 0 || modelState.selected)
                )
                  modelState.parameters.stopSequences = value

                return modelState
              })
            )
            setParametersContext({
              ...parametersContext,
              ["stopSequences"]: value,
            })
          }}
          defaultOptions={parametersContext.stopSequences}
          tooltipContent={
            <>
              <p>
                Up to four sequences where the API will stop <br /> generating
                further tokens. The returned text <br />
                will not contain the stop sequence.
              </p>
            </>
          }
        />

        {generate_show_probabilities()}

        <Tooltip delayDuration={300} skipDelayDuration={150}>
          <TooltipTrigger asChild>
            <div className="cursor-default flex justify-between align-middle inline-block align-middle mb-1">
              <p className="text-sm font-normal float-left align-text-top">
                Highlight Models
              </p>
              <Checkbox
                name="highlight-models"
                className="float-right self-center"
                checked={parametersContext.highlightModels}
                onCheckedChange={(val: boolean) => {
                  setParametersContext({
                    ...parametersContext,
                    highlightModels: val,
                  })
                }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side={isLg ? "left" : "bottom"}>
            <p>Disable model specific text highlights</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {generate_list()}
    </div>
  )
}

export default ParametersSidePanel