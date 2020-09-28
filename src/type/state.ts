import {State} from "core-fe";
import {HomeState} from "module/home";

export interface RootState extends State {
    app: {
        home: HomeState;
    };
}
