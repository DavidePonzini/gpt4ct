from dav_tools import argument_parser
import api_assistant

if __name__ == '__main__':
    argument_parser.set_developer_info('Davide Ponzini', 'davide.ponzini95@gmail.com')
    argument_parser.set_description('Print the content of a given thread')
    argument_parser.add_argument('thread_id', help='id of the thread to print');
    argument_parser.add_argument('limit', type=int, nargs='?', default=20, help='a limit on the number of objects to be returned. Limit can range between 1 and 100');

    api_assistant.print_thread(argument_parser.args.thread_id)
