import React from 'react';
import client from '../../api/client';
import follow from '../../api/follow';

const root = '/api';
import Employee from './list';
import Create from './create';
import Update from './update';

class Fellowship extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            employees: [],
            attributes: [],
            pageSize: 5,
            links: {},
            baris: "",
            form: "create",
            employee: []
        };
        this.onNavigate = this.onNavigate.bind(this);
        this.updatePageSize = this.updatePageSize.bind(this);
        this.updateNav = this.updateNav.bind(this);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
        this.handleNavNext = this.handleNavNext.bind(this);
        this.handleNavLast = this.handleNavLast.bind(this);
        this.barisAktif = this.barisAktif.bind(this);
        this.tampilForm = this.tampilForm.bind(this);
        this.gantiForm = this.gantiForm.bind(this);
        this.setEmployee = this.setEmployee.bind(this);
    }

    setEmployee(employee) {
        this.setState({employee: employee});
    }

    gantiForm(form) {
        this.setState({form: form});
    }

    tampilForm() {
        switch (this.state.form) {
            case "create":
                return <Create attributes={this.state.attributes}/>;
            case "update":
                return <Update
                    attributes={this.state.attributes}
                    employee={this.state.employee}
                    onNavigate={this.onNavigate}
                    pageSize={this.state.pageSize}/>;
        }
    }

    barisAktif(baris) {
        this.setState({baris: baris});
    }

    loadFromServer(pageSize) {
        follow(client, root, [
            {rel: 'employees', params: {size: pageSize}}]
        ).then(employeeCollection => {
            return client({
                method: 'GET',
                path: employeeCollection.entity._links.profile.href,
                headers: {'Accept': 'application/schema+json'}
            }).then(schema => {
                this.schema = schema.entity;
                return employeeCollection;
            });
        }).done(employeeCollection => {
            this.setState({
                employees: employeeCollection.entity._embedded.employees,
                attributes: Object.keys(this.schema.properties),
                pageSize: pageSize,
                links: employeeCollection.entity._links
            });
        });
    }

    onNavigate(navUri) {
        client({method: 'GET', path: navUri}).done(employeeCollection => {
            this.setState({
                employees: employeeCollection.entity._embedded.employees,
                attributes: this.state.attributes,
                pageSize: this.state.pageSize,
                links: employeeCollection.entity._links
            });
        });
    }

    updateNav(event) {
        this.updatePageSize(event.target.value);
    }

    async updatePageSize(pageSize) {
        await this.setState({pageSize: pageSize});
        await this.loadFromServer(pageSize);
    }

    handleNavFirst(e) {
        e.preventDefault();
        this.onNavigate(this.state.links.first.href);
    }

    handleNavPrev(e) {
        e.preventDefault();
        this.onNavigate(this.state.links.prev.href);
    }

    handleNavNext(e) {
        e.preventDefault();
        this.onNavigate(this.state.links.next.href);
    }

    handleNavLast(e) {
        e.preventDefault();
        this.onNavigate(this.state.links.last.href);
    }

    onNavigate(navUri) {
        client({method: 'GET', path: navUri}).done(employeeCollection => {
            this.setState({
                employees: employeeCollection.entity._embedded.employees,
                attributes: this.state.attributes,
                pageSize: this.state.pageSize,
                links: employeeCollection.entity._links
            });
        });
    }

    componentDidMount() {
        this.loadFromServer(this.state.pageSize);
    }

    render() {
        return (
            <div className="row my-md-3">

                <div className="col-7">
                    <table className="table table-hover table-sm">
                        <thead className="thead-light">
                        <tr>
                            <th scope="col">First Name</th>
                            <th scope="col">Last Name</th>
                            <th scope="col">Description</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.employees.map(employee =>
                            <Employee key={employee._links.self.href}
                                      id={employee._links.self.href}
                                      employee={employee}
                                      barisAktif={this.barisAktif}
                                      baris={this.state.baris}
                                      gantiForm={this.gantiForm}
                                      setEmployee={this.setEmployee}
                                      form={this.state.form}
                            />
                        )}
                        </tbody>
                    </table>
                    <nav aria-label="Page Navigation">
                        <ul className="pagination pagination-sm justify-content-sm-center">
                            <li className={"first" in this.state.links ? "page-item" : "page-item disabled"}>
                                <a className="page-link" onClick={this.handleNavFirst}>First</a>
                            </li>
                            <li className={"prev" in this.state.links ? "page-item" : "page-item disabled"}>
                                <a className="page-link" onClick={this.handleNavPrev}>Prev</a>
                            </li>
                            <li className="page-item">
                                <select
                                    className="form-control form-control-sm"
                                    value={this.state.pageSize}
                                    onChange={this.updateNav}>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="15">15</option>
                                    <option value="20">20</option>
                                    <option value="25">25</option>
                                </select>
                            </li>
                            <li className={"next" in this.state.links ? "page-item" : "page-item disabled"}>
                                <a className="page-link" onClick={this.handleNavNext}>Next</a>
                            </li>
                            <li className={"last" in this.state.links ? "page-item" : "page-item disabled"}>
                                <a className="page-link" onClick={this.handleNavLast}>Last</a>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="col">
                    <div className="card">
                        <div className="card-body pb-0">
                            {this.tampilForm()}
                        </div>
                    </div>
                </div>

            </div>
        )
    }

}

export default Fellowship;