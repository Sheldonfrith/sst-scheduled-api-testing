import { AxiosRequestConfig, AxiosResponse } from "axios";
import FormData from 'form-data';
import {BulkPredictionDTO, bulkPredictionsTimeUnit} from '../gpps-types/bulk-prediction-dto';
import { ISteelPileOut } from "../gpps-types/steel-pipe";
import { IPlasticPipeOut } from "../gpps-types/plastic-pipe";
import { HttpMethod } from "aws-sdk/clients/appmesh";

function choose(...choices: any[]) {
  return choices[Math.floor(Math.random() * choices.length)];
}


export interface APIBase {
  url: string;
  defaultHeaders: {[key: string]: string};
}


export class TestableApiError extends Error {
  public response: AxiosResponse
  public customMessage: string | undefined
  constructor(
      response: AxiosResponse,
      customMessage: string | undefined,
    ) {
    super(customMessage);
    this.name = this.constructor.name;
    this.customMessage = customMessage;
      this.response = response;
  }
}


export type ContentTypes = 'application/json' | 'application/x-www-form-urlencoded' | 'application/xml' | 'text/plain' | 'multipart/form-data';
export interface TestableAPIEndpoint<BodyType, ResponseBodyType> {
  url: string;
  method: HttpMethod;
  contentType: ContentTypes
  requestBodysAndResponseValidatorPairs: Record<string,{
    requestBody: ()=>BodyType;
    responseValidator: (response: AxiosResponse)=> TestableApiError | undefined;
  }>;
  universalErrorDetection: (response: AxiosResponse) => TestableApiError | undefined;
}


interface GTPSinglePredictionBody {
  latitude: any;
  longitude: any;
  depth:any;
  month: any;
  day: any;
}
export class GTPSinglePredictionEndpoint implements TestableAPIEndpoint<GTPSinglePredictionBody,number[]|any > {
  url = 'predictions/ground-temperatures/json/1';
  method = 'POST';
  contentType: ContentTypes = 'application/json';
  requestBodysAndResponseValidatorPairs = {
    'RapidAPIExample':{
      requestBody: ()=>{
        const b: GTPSinglePredictionBody = {
          latitude: 40,
          longitude: 20.01,
          depth: 0.43,
          month: 12,
          day: 4
        }
        return b
      },
      responseValidator: (response: AxiosResponse)=> {
        if (response.status === 200 
        && response.data.length === 1
        && response.data[0] === 10.032167035727177){
          return undefined;
        }
        return new TestableApiError( response, 'Response should be 200, array of length 1 and value 10.032167035727177');
      }
    },
    'EverythingWrong':{
      requestBody: ()=>{
        const b: GTPSinglePredictionBody = {
          latitude: undefined,
          longitude: 20000,
          depth: false,
          month: {'t':'2'},
          day: 3.3
        }
        return b
      },
      responseValidator: (response: AxiosResponse)=> {
        if (response.status === 400){
          return undefined;
        } 
        return new TestableApiError(response, 'Response should be 400');
      }
    },
    'LatitudeOutOfRange':{
      requestBody: ()=>{
        const b: GTPSinglePredictionBody = {
          latitude: -200,
          longitude: 20.01,
          depth: 0.43,
          month: 12,
          day: 4
        }
        return b
      },
      responseValidator: (response: AxiosResponse)=> {
        if (response.status === 400 
        && response.data.message.length === 1
        && response.data.message[0] === '-200 is less than the minimum of -63')
        {
          return undefined;
          
        }
        return new TestableApiError(response, 'Response should be 400 and message array of length 1 and message -200 is less than the minimum of -63');
      }
    },
    'DayIsNotInteger':{
      requestBody: ()=>{
        const b: GTPSinglePredictionBody = {
          latitude: 40,
          longitude: 20.01,
          depth: 0.43,
          month: 12,
          day: 3.3
        }
        return b
      },
      responseValidator: (response: AxiosResponse)=> {
        if (response.status === 400 
        && response.data.message.length === 1
        && response.data.message[0] === "3.3 is not of type 'integer'"){
          return undefined
        }
        return new TestableApiError(response,"Result should be 400 with message '3.3 is not of type 'integer'");
      }
    },
    'ShouldFailDueToIncorrectValidator': {
      requestBody: ()=>{
        const b: GTPSinglePredictionBody = {
          latitude: 40,
          longitude: 20.01,
          depth: 0.43,
          month: 12,
          day: undefined
        }
        return b
      }
      ,
      responseValidator: (response: AxiosResponse)=> {
        if (response.status === 300){
          return undefined;
        }
        return new TestableApiError(response, 'Response status should be 300');
      }

    }
  }
  universalErrorDetection (response: AxiosResponse<any, any>): TestableApiError | undefined {
      return undefined;
  }
}

// export class GPPSBulkInitializeEndpoint
//   implements TestableAPIEndpoint<BulkPredictionDTO, string>
// {
//   url: string = "BulkHeatPumpCapacityFromCSV/Initialize";
//   method: string = "POST";
//   api = GPPSApi;
//   contentType: ContentTypes = "application/json";
//   public generateRequestBody (): BulkPredictionDTO{

//     const pile: ISteelPileOut = {
//     }
//     const pipe: IPlasticPipeOut = {
//     }
//     const b: BulkPredictionDTO = {
//         name: "TestBulkPrediction-" + new Date().toISOString(),
//         withHeatPump: choose(true, false,undefined),//! depends on csv input
//         withKnownInletTemperature: choose(true, false,undefined),//! NO, depends on csv input
//         timeAndDateOfFirstRowStart: choose('getRandomTimeAndDate()',undefined),//! depends on csv input
//         timestepMagnitude: choose(undefined, 0, 1 ,3,0.5, -Infinity, Infinity),
//         timestepUnit: choose(bulkPredictionsTimeUnit),
//         autoGetGroundTemperature0m: choose(true, false,undefined),
//         autoGetGroundTemperature5m: choose(true, false,undefined),
//         autoGetGroundTemperature10m: choose(true, false,undefined),
//         steelPile: pile,
//         plasticPipe: pipe,
//         numberOfActivePilesInTheArray: 0,
//         flowChangeBeforeArray: 0,
//         averageInterPileFlowChangeInflow: 0,
//         maxInletFluidTemperature: 0,
//         minInletFluidTemperature: 0,
//         GTPInputs: {
//             lat: 0,
//             long: 0,
//             pileTopDepth:0,
//         }
//     }
//     return b;
//   };
//   public detectError(response: AxiosResponse, request: AxiosRequestConfig) {
//     if (typeof response.data !== "string") {
//       return new TestableApiError(request,response,"Response body is not a string");
//     }
//     //todo detect other errors
//     if (response.status !== 200) {
//         return new TestableApiError(request,response,undefined);
//     }
//     return undefined;
//   }

  
// }

// export class GPPSBulkProvideCSVEndpoint 
//     implements TestableAPIEndpoint<FormData,string>{
//         url (id: string) : string { return `BulkHeatPumpCapacityFromCSV/ProvideCsv/${id}`};
//         method: string = "POST";
//         api = GPPSApi;
//         contentType: ContentTypes = "multipart/form-data";
//         public generateRequestBody (): FormData{
//             //todo generate the actual csv string
//             let csvString = "CSV Data";
//             const csv: Buffer = Buffer.from(csvString);
//             const form = new FormData();
//             form.append('csv',csv, `testCsv${Date.now()}.csv`);
//             return form;
//         }
//         public detectError(response: AxiosResponse, request: AxiosRequestConfig) {
//             if (typeof response.data !== "string") {
//                 return new TestableApiError(request,response,"Response body is not a string");
//             }
//             //todo detect other errors
//             if (response.status !== 200) {
//                 return new TestableApiError(request,response,undefined);
//             }
//             return undefined;
//         }   
//     }