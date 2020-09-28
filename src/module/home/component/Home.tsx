import {Layout} from "antd";
import {async} from "core-fe";
import React from "react";
import {connect} from "react-redux";
import {Route, Switch} from "react-router-dom";
import Header from "./Header";
import "./home.less";
import Nav from "./Nav";
import NotFound from "./NotFound";
import Welcome from "./Welcome";

const Home = () => {

    return (
        <Layout>
            {/* <Nav /> */}
            <Layout>
                <Header />
                <Layout>
                    <Layout.Content className="app-layout">
                        <Switch>
                            <Route exact path="/" component={Welcome} />
                            <Route component={NotFound} />
                        </Switch>
                    </Layout.Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default connect()(Home);
