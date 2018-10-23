import React from 'react';
import client from '../../api/client';
import follow from '../../api/follow';
const root = '/api';
import Employee from './list';

class Fellowship extends React.Component {

    constructor(props) {
        super(props);
        this.state = {employees: [], attributes: [], pageSize: 5, links: {}};
        this.updatePageSize = this.updatePageSize.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onNavigate = this.onNavigate.bind(this);
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

    onCreate(newEmployee) {
        follow(client, root, ['employees']).then(employeeCollection => {
            return client({
                method: 'POST',
                path: employeeCollection.entity._links.self.href,
                entity: newEmployee,
                headers: {'Content-Type': 'application/json'}
            })
        }).then(response => {
            return follow(client, root, [
                {rel: 'employees', params: {'size': this.state.pageSize}}]);
        }).done(response => {
            if (typeof response.entity._links.last !== "undefined") {
                this.onNavigate(response.entity._links.last.href);
            } else {
                this.onNavigate(response.entity._links.self.href);
            }
        });
    }

    onDelete(employee) {
        client({method: 'DELETE', path: employee._links.self.href}).done(response => {
            this.loadFromServer(this.state.pageSize);
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

    updatePageSize(pageSize) {
        if (pageSize !== this.state.pageSize) {
            this.loadFromServer(pageSize);
        }
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
                            <th scope="col"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.employees.map(employee =>
                            <Employee key={employee._links.self.href} employee={employee} onDelete={this.onDelete}/>
                        )}
                        </tbody>
                    </table>
                    <nav aria-label="Page Navigation">
                        <ul className="pagination pagination-sm justify-content-sm-center">
                            <li className="page-item disabled"><a className="page-link">First</a></li>
                            <li className="page-item"><a className="page-link">Prev</a></li>
                            <li className="page-item">
                                <select className="form-control form-control-sm" id="pagelimit">
                                    <option>5</option>
                                    <option>10</option>
                                    <option>15</option>
                                    <option>20</option>
                                    <option>25</option>
                                </select>
                            </li>
                            <li className="page-item"><a className="page-link">Next</a></li>
                            <li className="page-item"><a className="page-link">Last</a></li>
                        </ul>
                    </nav>
                </div>

                <div className="col">
                    <div className="card">
                        <div className="card-body pb-0">
                            <h4 className="title text-center">Add Fellowship</h4>
                            <hr className="mb-md-4"/>
                            <form>
                                <div className="form-group row">
                                    <label htmlFor="firstName" className="col-sm-4 col-form-label">Firstname</label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control" id="firstName"
                                               placeholder="Input firstname..."/>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="lastName" className="col-sm-4 col-form-label">Lastname</label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control" id="lastName"
                                               placeholder="Input lastname..."/>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="descriptions"
                                           className="col-sm-4 col-form-label">Descriptions</label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control" id="descriptions"
                                               placeholder="Input descriptions..."/>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <button type="submit" className="btn btn-success btn-block mx-3 mt-md-2">Add
                                        Fellow
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

}

export default Fellowship;